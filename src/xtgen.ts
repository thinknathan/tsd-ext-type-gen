#!/usr/bin/env node

import * as fs from 'fs';
import AdmZip from 'adm-zip';
import * as path from 'path';
import * as process from 'process';
import fetch from 'node-fetch';
import { parse } from 'yaml';
import yargs from 'yargs';

const DEBUG = false;
// Definitions file starts with this string
const HEADER = `/** @noSelfInFile */
/// <reference types="@typescript-to-lua/language-extensions" />
/// <reference types="@ts-defold/types" />\n`;

// Invalid names in TypeScript
const INVALID_NAMES = [
	'any',
	'boolean',
	'break',
	'case',
	'catch',
	'class',
	'const',
	'continue',
	'debugger',
	'default',
	'delete',
	'do',
	'else',
	'enum',
	'export',
	'extends',
	'false',
	'finally',
	'for',
	'function',
	'if',
	'implements',
	'import',
	'in',
	'instanceof',
	'interface',
	'let',
	'new',
	'null',
	'package',
	'private',
	'protected',
	'public',
	'return',
	'static',
	'super',
	'switch',
	'throw',
	'true',
	'try',
	'typeof',
	'undefined',
	'var',
	'void',
	'while',
	'with',
	'yield',
];

// All valid types are listed here
const KNOWN_TYPES: { [key: string]: string } = {
	TBL: '{}',
	TABLE: '{}',
	NUM: 'number',
	NUMBER: 'number',
	NUMMBER: 'number', // intentional typo
	INT: 'number',
	INTEGER: 'number',
	FLOAT: 'number',
	STR: 'string',
	STRING: 'string',
	BOOL: 'boolean',
	BOOLEAN: 'boolean',
	FN: '(...args: any[]) => any',
	FUNC: '(...args: any[]) => any',
	FUNCTION: '(...args: any[]) => any',
	HASH: 'hash',
	URL: 'url',
	NODE: 'node',
	BUFFER: 'buffer',
	BUFFERSTREAM: 'bufferstream',
	VECTOR3: 'vmath.vector3',
	VECTOR4: 'vmath.vector4',
	MATRIX: 'vmath.matrix4',
	MATRIX4: 'vmath.matrix4',
	QUAT: 'vmath.quaternion',
	QUATERNION: 'vmath.quaternion',
	QUATERTION: 'vmath.quaternion', // intentional typo
	LUAUSERDATA: 'LuaUserdata',
	// TO-DO: Parse strings that have pipes instead of relying on a naive lookup
	'STRING|HASH|URL': 'string | hash | url',
	'STRING|URL|HASH': 'string | hash | url',
	'HASH|STRING|URL': 'string | hash | url',
	'HASH|URL|STRING': 'string | hash | url',
	'URL|STRING|HASH': 'string | hash | url',
	'URL|HASH|STRING': 'string | hash | url',
	'STRING | HASH | URL': 'string | hash | url',
	'STRING | URL | HASH': 'string | hash | url',
	'HASH | STRING | URL': 'string | hash | url',
	'HASH | URL | STRING': 'string | hash | url',
	'URL | STRING | HASH': 'string | hash | url',
	'URL | HASH | STRING': 'string | hash | url',
	'STRING|HASH': 'string | hash',
	'HASH|STRING': 'string | hash',
	'STRING | HASH': 'string | hash',
	'HASH | STRING': 'string | hash',
};

// We'll make default return types slightly stricter than default param types
const DEFAULT_PARAM_TYPE = 'any';
const DEFAULT_RETURN_TYPE = 'unknown';
// Theoretically, it's impossible not to have a name, but just in case
const DEFAULT_NAME_IF_BLANK = 'missingName';

async function main() {
	console.time('Done in');

	// Command line args
	const argv = await yargs(process.argv.slice(2))
		.option('p', {
			alias: 'project',
			describe: 'Path to your project file',
			type: 'string',
			default: './app/game.project',
		})
		.option('o', {
			alias: 'outDir',
			describe: 'The output directory',
			type: 'string',
			default: './@types',
		})
		.parse();

	const project = argv.p;
	const outDir = argv.o;

	// Find project file
	const absPath = path.join(process.cwd(), project);

	// Read project file
	let iniData: string = '';
	try {
		iniData = await fs.promises.readFile(absPath, 'utf8');
	} catch (e) {
		console.error(e, absPath);
		return;
	}

	// Locate dependencies
	const deps = iniData
		.split('\n')
		.filter((l) => l.startsWith('dependencies'))
		.map((dep) => {
			return dep.split('=')[1].trim();
		});

	if (deps.length === 0) {
		console.error('Could not find dependencies in project file.', absPath);
		return;
	}

	// Iterate over each dependency
	await Promise.all(
		deps.map(async (dep) => {
			const details = {
				name: '', // We'll guess the name later
				isLua: true,
			};

			// Fetch dependency zip file
			const req = await fetch(dep);
			if (!req.ok) {
				console.error(`Failed to fetch dependency ${dep}`);
				return;
			}

			// Get a node-specific buffer from the request
			const zipBuffer = Buffer.from(await req.arrayBuffer());

			// Unzip file into memory
			const zip = new AdmZip(zipBuffer);
			if (!zip.test()) {
				console.error(`Zip archive damaged for ${dep}`);
				return;
			}

			// Locate all files inside the zip
			const files = zip.getEntries();

			// If there's a C++ file, it's probably not a Lua module
			files.some((entry) => {
				if (entry.name.endsWith('.cpp')) {
					details.isLua = false;
					return true;
				}
				return false;
			});

			let depFilename = '';
			try {
				const depUrl = dep.split('/');
				if (depUrl.length > 0) {
					depFilename = depUrl[depUrl.length - 1];
					const lastPeriodIndex = depFilename.lastIndexOf('.');
					if (lastPeriodIndex !== -1) {
						depFilename = depFilename.substring(0, lastPeriodIndex);
					}
				}
				// Remove special characters
				depFilename = depFilename.replace(/[^a-zA-Z0-9_.]/g, '');
				// Shorten if the name is much too long
				if (depFilename.length > 64) {
					depFilename = depFilename.substring(0, 64);
				}
			} catch {
				// Silence error
				depFilename = '';
			}

			// Attempt to locate a `script_api` file to parse
			let api: ScriptApi = [];
			try {
				api = files
					.filter((entry) => entry.name.endsWith('.script_api'))
					// Use a YAML parser to construction a JS object
					.map<ScriptApi>((entry) => {
						// Guess the name based on the script_api's filename
						details.name =
							entry.name.split('.')[0] +
							`${depFilename ? '_' + depFilename : ''}`;
						return parse(entry.getData().toString('utf8'));
					})[0];
			} catch (e) {
				console.error(e, dep);
				return;
			}

			// If we have no API to parse, exit early
			if (!api || api.length === 0) {
				return;
			}

			// Make output directory
			try {
				await fs.promises.mkdir(path.join(process.cwd(), outDir));
			} catch {
				// Silence this error
			}

			// Debug: Export JSON of parsed YAML
			if (DEBUG) {
				try {
					await fs.promises.writeFile(
						path.join(process.cwd(), outDir, details.name + '.json'),
						JSON.stringify(api),
					);
				} catch (e) {
					console.error(e, dep);
					return;
				}
			}

			// Turn our parsed object into definitions
			const result = generateTypeScriptDefinitions(api, details, true);

			if (result) {
				// Guess the URL by including only the first 6 strings split by slash
				const depUrl = dep.split('/').slice(0, 5).join('/');

				// Append header
				const final = `${HEADER}/**\n * @url ${depUrl}\n * @noResolution\n */\n${result}`;

				// Save the definitions to file
				try {
					await fs.promises.writeFile(
						path.join(process.cwd(), outDir, details.name + '.d.ts'),
						final,
					);
				} catch (e) {
					console.error(e, dep);
					return;
				}
			}
		}),
	);

	console.timeEnd('Done in');
	console.log(`Exported definitions to ${path.join(process.cwd(), outDir)}`);
}

// Utility Functions

// Check if a string is all uppercase with optional underscores
function isAllUppercase(str: string): boolean {
	return /^[A-Z0-9_]+$/.test(str);
}

// Check type of API entry
function isApiTable(
	entry: ScriptApiTable | ScriptApiEntry | ScriptApiFunction,
): entry is ScriptApiTable {
	return (
		(typeof entry.type === 'string' && entry.type.toUpperCase() === 'TABLE') ||
		'members' in entry
	);
}

// Check type of API entry
function isApiFunc(
	entry: ScriptApiTable | ScriptApiEntry | ScriptApiFunction,
): entry is ScriptApiFunction {
	return (
		(typeof entry.type === 'string' &&
			entry.type.toUpperCase() === 'FUNCTION') ||
		'parameters' in entry
	);
}

function isNameInvalid(name: string, isParam: boolean) {
	name = String(name);
	if (isParam) {
		return INVALID_NAMES.includes(name);
	} else {
		return ['this'].concat(INVALID_NAMES).includes(name);
	}
}

// Sanitizes name
function getName(name: string, isParam: boolean) {
	let modifiedName = String(name);

	if (isParam) {
		// Special case: arguments
		modifiedName = modifiedName.replace(/^\.\.\.$/, 'args');
		// Special case: Lua's `self` variable
		modifiedName = modifiedName.replace(/^self$/, 'this');
	}

	// Sanitize type name: allow only alpha-numeric, underscore, dollar sign
	modifiedName = modifiedName.replace(/[^a-zA-Z0-9_$]/g, '_');

	// If the first character is a number, add a dollar sign to start
	if (/^\d/.test(modifiedName)) {
		modifiedName = '$' + modifiedName;
	}

	// If we're modifying a function name, not a parameter, give a warning
	if (!isParam && modifiedName !== name) {
		console.warn(
			`Modifying invalid ${typeof name} "${name}" to "${modifiedName}"`,
		);
	}

	// Check against the reserved keywords in TypeScript
	if (isNameInvalid(modifiedName, isParam)) {
		modifiedName = modifiedName + '_';
	}

	return modifiedName;
}

// Transforms API type to TS type
function getType(
	type: string | string[] | undefined,
	context: 'param' | 'return',
): string {
	let defaultType = DEFAULT_PARAM_TYPE;
	if (context === 'return') {
		defaultType = DEFAULT_RETURN_TYPE;
	}
	if (typeof type === 'string') {
		return KNOWN_TYPES[type.toUpperCase()] ?? defaultType;
	} else if (Array.isArray(type)) {
		const typeSet = new Set<string>();
		type.forEach((rawType) => {
			if (typeof rawType === 'string') {
				typeSet.add(KNOWN_TYPES[rawType.toUpperCase()] ?? defaultType);
			}
		});
		const typeArray = Array.from(typeSet);
		return typeArray.length ? typeArray.join(' | ') : defaultType;
	}
	return defaultType;
}

function sanitizeForComment(str: string) {
	return str.replace(/\*\//g, '*\\/');
}

/**
 * @param name the original, unsanitized name
 * @param root
 */
function getDeclarationKeyword(name: string, root: boolean) {
	if (root) {
		return 'declare';
	} else if (isNameInvalid(name, false)) {
		return '';
	} else {
		return 'export';
	}
}

// Transforms and sanitizes descriptions
function getComments(entry: ScriptApiFunction) {
	// Make sure the description doesn't break out of the comment
	const desc = entry.desc || entry.description;
	let newDesc = desc ?? '';

	// If params exist, let's create `@param`s in JSDoc format
	if (entry.parameters && Array.isArray(entry.parameters)) {
		newDesc = getParamComments(entry.parameters, newDesc);
	}

	// Comments for `@returns`
	const returnObj = entry.return || entry.returns;
	if (returnObj) {
		newDesc = getReturnComments(returnObj, newDesc);
	}

	// Comments for `@example`
	if (entry.examples && Array.isArray(entry.examples)) {
		newDesc = getExampleComments(entry.examples, newDesc);
	}

	return newDesc ? `/**\n * ${sanitizeForComment(newDesc)}\n */\n` : '';
}

function getReturnComments(
	returnObj: ScriptApiEntry | ScriptApiEntry[],
	newDesc: string,
) {
	let returnType = '';
	let comments = '';

	if (Array.isArray(returnObj)) {
		if (returnObj.length > 1) {
			returnType = `LuaMultiReturn<[${returnObj.map((ret) => ret.type).join(', ')}]>`;
		} else {
			returnType = Array.isArray(returnObj[0].type)
				? returnObj[0].type.join(' | ')
				: returnObj[0].type ?? '';
		}
		// Add comments if they exist
		if (returnObj.some((ret) => ret.desc || ret.description)) {
			comments = `${returnObj.map((ret) => ret.desc || ret.description).join(' | ')}`;
		}
	} else if (returnObj.type) {
		// Instead of getting a TS type here, use the raw Lua type
		returnType = Array.isArray(returnObj.type)
			? returnObj.type.join(' | ')
			: returnObj.type;
		comments = getType(returnObj.type, 'return');
	}

	// If we've figured out a comment, but not a returnType
	if (comments.length && !returnType.length) {
		returnType = DEFAULT_RETURN_TYPE;
	}

	newDesc += `\n * @returns {${returnType}} ${comments}`;
	return newDesc;
}

function getParamComments(parameters: ScriptApiParameter[], newDesc: string) {
	parameters.forEach((param) => {
		const name = param.name ? getName(param.name, true) : '';
		if (name) {
			newDesc += `\n * @param`;
			if (param.type) {
				// Instead of getting a TS type here, use the raw Lua type
				let rawType = '';
				if (Array.isArray(param.type)) {
					// If multiple types, join them into a string
					rawType = param.type.join('|');
				} else {
					rawType = param.type;
				}
				// Sanitize type name, allow alpha-numeric, underscore and pipe
				rawType = rawType.replace(/[^a-zA-Z|0-9_$]/g, '_');
				newDesc += ` {${rawType}}`;
			}
			newDesc += ` ${name}`;

			const desc = param.desc || param.description;
			if (desc) {
				newDesc += ` ${desc}`;
			}

			if (param.fields && Array.isArray(param.fields)) {
				newDesc = getParamFields(param.fields, newDesc);
			}
		}
	});
	return newDesc;
}

function getParamFields(fields: ScriptApiEntry[], newDesc: string) {
	fields.forEach((field) => {
		newDesc += ` ${JSON.stringify(field)}`;
	});
	return newDesc;
}

function getExampleComments(examples: ScriptApiExample[], newDesc: string) {
	examples.forEach((example) => {
		const desc = example.desc || example.description;
		if (desc) {
			newDesc += `\n * @example ${desc}`;
		}
	});
	return newDesc;
}

/**
 * @param name must be the original, unsanitized name
 * @param isParam
 */
function getExportOverride(name: string, isParam: boolean) {
	if (isNameInvalid(name, isParam)) {
		return `export {${getName(name, isParam)} as ${name}}`;
	} else {
		return '';
	}
}

// Main Functions

// Function to generate TypeScript definitions for ScriptApiTable
function generateTableDefinition(
	entry: ScriptApiTable,
	details: ScriptDetails,
	root: boolean,
): string {
	const declaration = getDeclarationKeyword(entry.name ?? '', root);
	const override = entry.name ? getExportOverride(entry.name, false) : '';
	const name = entry.name ? getName(entry.name, false) : DEFAULT_NAME_IF_BLANK;

	let tableDeclaration = `${declaration ? declaration + ' ' : ''}namespace ${name} {\n`;
	if (root) {
		tableDeclaration = details.isLua
			? `${declaration} module '${name}.${name}' {\n`
			: `${declaration} namespace ${name} {\n`;
	}

	if (entry.members && Array.isArray(entry.members)) {
		return `${tableDeclaration}${generateTypeScriptDefinitions(entry.members, details, false)}}${override ? override + ';\n' : ''}`;
	} else {
		return `${tableDeclaration}}${override ? override + ';\n' : ''}`;
	}
}

// Function to generate TypeScript definitions for ScriptApiFunction
function generateFunctionDefinition(
	entry: ScriptApiFunction,
	isParam: boolean,
	root: boolean,
): string {
	const parameters = entry.parameters
		? entry.parameters.map(getParameterDefinition).join(', ')
		: '';
	const returnType = getReturnType(entry.return || entry.returns);

	if (isParam) {
		return `(${parameters}) => ${returnType}`;
	} else {
		const comment = getComments(entry);
		const declaration = getDeclarationKeyword(entry.name ?? '', root);
		const override = entry.name ? getExportOverride(entry.name, isParam) : '';
		const name = entry.name
			? getName(entry.name, false)
			: DEFAULT_NAME_IF_BLANK;
		return `${comment}${declaration ? declaration + ' ' : ''}function ${name}(${parameters}): ${returnType};\n${override ? override + ';\n' : ''}`;
	}
}

function getParameterDefinition(param: ScriptApiParameter): string {
	const name = param.name ? getName(param.name, true) : DEFAULT_NAME_IF_BLANK;
	const optional = param.optional ? '?' : '';
	let type = getType(param.type, 'param');

	if (type === KNOWN_TYPES['FUNCTION']) {
		// Get a more specific function signature
		type = generateFunctionDefinition(param, true, false);
	} else if (
		type === KNOWN_TYPES['TABLE'] &&
		param.fields &&
		Array.isArray(param.fields)
	) {
		// Try to get the exact parameters of a table
		type = `{ ${param.fields.map(getParameterDefinition).join('; ')} }`;
	}
	return `${name}${optional}: ${type}`;
}

function getReturnType(
	returnObj: ScriptApiEntry | ScriptApiEntry[] | undefined,
): string {
	if (!returnObj) {
		return 'void';
	}

	if (Array.isArray(returnObj)) {
		if (returnObj.length > 1) {
			return `LuaMultiReturn<[${returnObj.map((ret) => getType(ret.type, 'return')).join(', ')}]>`;
		} else {
			return `${getType(returnObj[0].type, 'return')}`;
		}
	} else if (returnObj.type) {
		return getType(returnObj.type, 'return');
	} else {
		return 'void'; // Fallback in case we can't parse it at all
	}
}

// Function to generate TypeScript definitions for ScriptApiEntry
function generateEntryDefinition(entry: ScriptApiEntry, root: boolean): string {
	const declaration = getDeclarationKeyword(entry.name ?? '', root);
	const override = entry.name ? getExportOverride(entry.name, false) : '';
	const name = entry.name ? getName(entry.name, false) : DEFAULT_NAME_IF_BLANK;
	const varType = isAllUppercase(name) ? 'const' : 'let';
	const type = getType(entry.type, 'return');
	const comment = getComments(entry);
	return `${comment}${declaration ? declaration + ' ' : ''}${varType} ${name}: ${type};\n${override ? override + ';\n' : ''}`;
}

// Main function to generate TypeScript definitions for ScriptApi
function generateTypeScriptDefinitions(
	api: ScriptApi,
	details: ScriptDetails,
	root: boolean,
): string {
	let definitions = '';

	const namespaces: { [key: string]: ScriptApi } = {};

	api.forEach((entry) => {
		// Handle nested properties
		if (typeof entry.name === 'string' && entry.name.includes('.')) {
			const namePieces = entry.name.split('.');
			const entryNamespace = namePieces[0];
			const entryName = namePieces[1];

			// Create namespace if not already exists
			namespaces[entryNamespace] = namespaces[entryNamespace] || [];

			// Update entry name and add to the namespace
			entry.name = entryName;
			namespaces[entryNamespace].push(entry);
		} else if (isApiTable(entry)) {
			definitions += generateTableDefinition(entry, details, root);
		} else if (isApiFunc(entry)) {
			definitions += generateFunctionDefinition(entry, false, root);
		} else {
			definitions += generateEntryDefinition(entry, root);
		}
	});

	// Loop through namespaces
	for (const namespace in namespaces) {
		if (Object.prototype.hasOwnProperty.call(namespaces, namespace)) {
			const namespaceEntries = namespaces[namespace];

			definitions += `${root ? 'declare' : 'export'} namespace ${namespace} {\n`;

			// Loop through entries within the namespace
			namespaceEntries.forEach((entry) => {
				if (isApiTable(entry)) {
					definitions += generateTableDefinition(entry, details, false);
				} else if (isApiFunc(entry)) {
					definitions += generateFunctionDefinition(entry, false, false);
				} else {
					definitions += generateEntryDefinition(entry, false);
				}
			});

			definitions += '}\n';
		}
	}

	return definitions;
}

// Run the main function
main();
