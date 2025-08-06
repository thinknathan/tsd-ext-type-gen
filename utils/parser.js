import { KNOWN_TYPES, TYPES_TO_SKIP, DEFAULT_NAME_IF_BLANK, } from './constants.js';
import { isAllUppercase, isApiTable, isApiFunc, isTypeDef, getName, getDeclarationKeyword, getExportOverride, alphabetizeApi, } from './utils.js';
import { getComments } from './commentParser.js';
import { getType } from './typeParser.js';
/**
 * Generates the definitions for the API
 * @returns Complete type definitions
 */
function parseAll(api, isExternalLuaModule, root) {
    let definitions = '';
    const namespaces = {};
    const classes = {};
    // Run 6 times to find nested namespaces and classes
    for (let i = 0; i < 6; i++) {
        // Split into namespaces and classes
        api.forEach((entry, index) => {
            const result = splitNamespacesAndClasses(entry, namespaces, classes);
            if (result === true) {
                // console.log('Run #', i, 'Moving', entry.name);
                api.splice(index, 1);
            }
        });
    }
    // Look through base entries
    api.forEach((entry) => {
        definitions += parseBasedOnType(entry, isExternalLuaModule, root, false, false);
    });
    // Loop through namespaces we've found
    for (const namespace in namespaces) {
        if (Object.prototype.hasOwnProperty.call(namespaces, namespace)) {
            const namespaceEntries = namespaces[namespace];
            // Alphabetize entries based on name
            namespaceEntries.sort(alphabetizeApi);
            definitions += `${getDeclarationKeyword(root)} namespace ${namespace} {\n`;
            // Loop through entries within the namespace
            namespaceEntries.forEach((entry) => {
                definitions += parseBasedOnType(entry, isExternalLuaModule, false, false, false);
            });
            definitions += '}\n';
        }
    }
    for (const iclass in classes) {
        if (Object.prototype.hasOwnProperty.call(classes, iclass)) {
            const classEntries = classes[iclass];
            // Alphabetize entries based on name
            classEntries.sort(alphabetizeApi);
            definitions += `${root ? 'declare ' : ''}class ${iclass} {\n`;
            // Loop through entries within the namespace
            classEntries.forEach((entry) => {
                definitions += parseBasedOnType(entry, isExternalLuaModule, false, false, true);
            });
            definitions += '}\n';
        }
    }
    return definitions;
}
/**
 * Push nested methods and properties into namespaces and classes
 * @returns true if entry was moved
 */
function splitNamespacesAndClasses(entry, namespaces, classes) {
    if (typeof entry.name === 'string') {
        if (entry.name.includes('.')) {
            const namePieces = entry.name.split('.');
            const entryNamespace = namePieces.slice(0, -1).join('.');
            const entryName = namePieces[namePieces.length - 1];
            // Create namespace if not already exists
            namespaces[entryNamespace] = namespaces[entryNamespace] || [];
            // Update entry name and add to the namespace
            entry.name = entryName;
            namespaces[entryNamespace].push(entry);
            return true;
        }
        else if (entry.name.includes(':')) {
            const namePieces = entry.name.split(':');
            const classNamespace = namePieces.slice(0, -1).join(':');
            const className = namePieces[namePieces.length - 1];
            // Create namespace if not already exists
            classes[classNamespace] = classes[classNamespace] || [];
            // Update entry name and add to the namespace
            entry.name = className;
            classes[classNamespace].push(entry);
            return true;
        }
    }
    return false;
}
/** Delegates parsing based on type */
function parseBasedOnType(entry, isExternalLuaModule, root, isParam, isClass) {
    let definitions = '';
    if (typeof entry.type === 'string' &&
        TYPES_TO_SKIP.includes(entry.type.toUpperCase())) {
        // Skip
    }
    else if (entry.type === 'TYPEDEF') {
        // TO-DO: Handle official type defs from the API
    }
    else if (isTypeDef(entry)) {
        definitions += parseTypeDefinition(entry, root);
    }
    else if (isApiTable(entry)) {
        definitions += parseTable(entry, isExternalLuaModule, root);
    }
    else if (isApiFunc(entry)) {
        definitions += parseFunction(entry, isParam, root);
    }
    else {
        definitions += parseGeneric(entry, root);
    }
    if (isClass) {
        // Hacky way to remove export keywords for class definitions
        definitions = definitions
            .replace('export function ', '')
            .replace('export const ', '')
            .replace('export let ', '');
    }
    return definitions;
}
/** Generates type declarations based on global pre patches */
function parseTypeDefinition(entry, root) {
    const declaration = getDeclarationKeyword(root);
    if (entry.name) {
        const name = getName(entry.name, false);
        const comment = getComments(entry);
        return `${comment}${declaration ? declaration + ' ' : ''}type ${name} = ${entry.typeDef};\n`;
    }
    console.error(`Failed type definition for ${entry.name}`);
    return '';
}
/** Generates TypeScript definitions for ScriptApiTable */
function parseTable(entry, isExternalLuaModule, root, isReturn) {
    // Weird workaround for bug in Defold v1.10.4
    const DEFAULT_NAME_IF_BLANK_MODIFIED = root && isExternalLuaModule === false ? 'font' : DEFAULT_NAME_IF_BLANK;
    const declaration = getDeclarationKeyword(root);
    const override = entry.name ? getExportOverride(entry.name, false) : '';
    const name = entry.name
        ? getName(entry.name, false)
        : DEFAULT_NAME_IF_BLANK_MODIFIED;
    let tableDeclaration = `${declaration} namespace ${name} {\n`;
    if (root) {
        tableDeclaration = isExternalLuaModule
            ? `${declaration} module '${name}.${name}' {\n`
            : `${declaration} namespace ${name} {\n`;
    }
    if (entry.members && Array.isArray(entry.members)) {
        // Alphabetize entries based on name
        // As long as we're sure we're not actually modifying a function
        if (!isApiFunc(entry)) {
            entry.members.sort(alphabetizeApi);
        }
        if (isReturn) {
            return `{${entry.members.map(getParams).join(', ')}}`;
        }
        return `${tableDeclaration}${parseAll(entry.members, isExternalLuaModule, false)}}${override ? override + ';\n' : ''}`;
    }
    else if (entry.fields && Array.isArray(entry.fields)) {
        if (isReturn) {
            return `{${entry.fields.map(getParams).join(', ')}}`;
        }
        return `${tableDeclaration}${parseAll(entry.fields, isExternalLuaModule, false)}}${override ? override + ';\n' : ''}`;
    }
    else {
        if (isReturn) {
            return getType(entry.type, 'return', entry.useExactType);
        }
        return `${tableDeclaration}}${override ? override + ';\n' : ''}`;
    }
}
/** Function to generate TypeScript definitions for ScriptApiFunction */
function parseFunction(entry, isParam, root, isReturn) {
    const parameters = entry.parameters
        ? entry.parameters.map(getParams).join(', ')
        : '';
    const returnType = getReturnType(entry.return || entry.returns);
    if (isParam || isReturn) {
        return `(${parameters}) => ${returnType}`;
    }
    else {
        const comment = getComments(entry);
        const declaration = getDeclarationKeyword(root);
        const override = entry.name ? getExportOverride(entry.name, isParam) : '';
        const name = entry.name
            ? getName(entry.name, false)
            : DEFAULT_NAME_IF_BLANK;
        return `${comment}${declaration ? declaration + ' ' : ''}function ${name}(${parameters}): ${returnType};\n${override ? override + ';\n' : ''}`;
    }
}
function getParams(param) {
    const name = param.name ? getName(param.name, true) : DEFAULT_NAME_IF_BLANK;
    const optional = param.optional ? '?' : '';
    let type = getType(param.type, 'param', param.useExactType);
    if (type === KNOWN_TYPES['FUNCTION']) {
        // Get a more specific function signature
        if (param.parameters) {
            // parse sub parameters
            let parsedSubParams = '';
            param.parameters.map((subparam) => {
                if (subparam && subparam.name) {
                    let subParamType = getType(subparam.type, 'param', subparam.useExactType);
                    const fOptional = subparam.optional ? '?' : '';
                    if (subParamType === KNOWN_TYPES['TABLE'] &&
                        Array.isArray(subparam.fields)) {
                        subParamType = `{ ${subparam.fields.map(getParams).join('; ')} }`;
                    }
                    parsedSubParams = `${parsedSubParams}${getName(subparam.name, true)}${fOptional}: ${subParamType}, `;
                }
            });
            parsedSubParams = parsedSubParams.trim();
            if (parsedSubParams.length > 1) {
                type = `(${parsedSubParams}) => void`;
            }
        }
        else {
            type = parseFunction(param, true, false);
        }
    }
    else if (type === KNOWN_TYPES['TABLE'] &&
        param.fields &&
        Array.isArray(param.fields)) {
        // Try to get the exact parameters of a table
        type = `{ ${param.fields.map(getParams).join('; ')} }`;
    }
    let spread = '';
    if (param.spread) {
        spread = '...';
    }
    return `${spread}${name}${optional}: ${type}`;
}
/** Used for parse function */
function getReturnType(returnObj) {
    if (!returnObj) {
        return 'void';
    }
    if (Array.isArray(returnObj)) {
        if (returnObj.length > 1) {
            return `LuaMultiReturn<[${returnObj.map((ret) => getReturnType(ret)).join(', ')}]>`;
        }
        else {
            return `${getReturnType(returnObj[0])}`;
        }
    }
    else if (isApiTable(returnObj)) {
        return parseTable(returnObj, false, false, true);
    }
    else if (isApiFunc(returnObj)) {
        return parseFunction(returnObj, false, false, true);
    }
    else if (returnObj.type && typeof returnObj.type === 'string') {
        return getType(returnObj.type, 'return', returnObj.useExactType);
    }
    return 'void';
}
/** Generate TypeScript definitions for ScriptApiEntry */
function parseGeneric(entry, root) {
    const declaration = getDeclarationKeyword(root);
    const override = entry.name ? getExportOverride(entry.name, false) : '';
    const name = entry.name ? getName(entry.name, false) : DEFAULT_NAME_IF_BLANK;
    const varType = isAllUppercase(name) ? 'const' : 'let';
    const type = getType(entry.type, 'return', entry.useExactType);
    const comment = getComments(entry);
    return `${comment}${declaration ? declaration + ' ' : ''}${varType} ${name}: ${type};\n${override ? override + ';\n' : ''}`;
}
export { parseAll };
