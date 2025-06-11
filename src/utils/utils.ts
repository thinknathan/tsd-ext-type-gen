import { INVALID_NAMES, KNOWN_TYPES } from './constants.js';

// Utility Functions

/** Check if a string is all uppercase with optional underscores */
function isAllUppercase(str: string): boolean {
	return typeof str === 'string' && /^[A-Z0-9_]+$/.test(str);
}

/** Check type of API entry */
function isApiTable(
	entry: ScriptApiTable | ScriptApiEntry | ScriptApiFunction,
): entry is ScriptApiTable {
	return (
		(typeof entry.type === 'string' &&
			KNOWN_TYPES[entry.type.toUpperCase()] === KNOWN_TYPES['TABLE']) ||
		'members' in entry ||
		'fields' in entry
	);
}

/** Check type of API entry */
function isApiFunc(
	entry: ScriptApiTable | ScriptApiEntry | ScriptApiFunction,
): entry is ScriptApiFunction {
	return (
		(typeof entry.type === 'string' &&
			KNOWN_TYPES[entry.type.toUpperCase()] === KNOWN_TYPES['FUNCTION']) ||
		'parameters' in entry ||
		'returns' in entry
	);
}

/**
 * Check for type definition entry,
 * which is only used in global patches as part of this program
 */
function isTypeDef(
	entry: ScriptApiEntry | ScriptApiFunction | ScriptApiTable | PatchEntry,
): entry is PatchEntry {
	return entry.type === 'typeDef' && !!(entry as PatchEntry).typeDef;
}

/** Check for names that are invalid in TypeScript */
function isNameInvalid(name: string, isParam: boolean) {
	if (typeof name !== 'string') {
		name = String(name);
	}
	if (isParam) {
		return INVALID_NAMES.includes(name);
	} else {
		// The `this` keyword is not allowed outside of parameters
		return ['this'].concat(INVALID_NAMES).includes(name);
	}
}

/** Removes HTML and characters that could terminate a comment */
function sanitizeForComment(str: string) {
	// Strip terminating comments
	str = str.replace(/\*\//g, '*\\/');
	// Replace code blocks
	str = str.replaceAll('<code>', '`').replaceAll('</code>', '`');
	// Replace icons
	str = str
		.replaceAll('<span class="icon-attention"></span>', '⚠')
		.replaceAll('<span class="icon-html5"></span>', '🌎')
		.replaceAll('<span class="icon-android"></span>', '🤖')
		.replaceAll('<span class="icon-osx"></span>', '📱')
		.replaceAll('<span class="icon-macos"></span>', '🍎')
		.replaceAll('<span class="icon-linux"></span>', '🐧')
		.replaceAll('<span class="icon-windows"></span>', '🪟');
	// Strip HTML
	str = str.replace(/<[^>]*>?/gm, '');
	// Replace HTML special characters
	str = str
		.replaceAll('&quot;', '"')
		.replaceAll('&amp;', '&')
		.replaceAll('&lt;', '<')
		.replaceAll('&gt;', '>')
		.replaceAll('&nbsp;', ' ')
		.replaceAll('&gt;', '>')
		.replaceAll('&lt;', '<')
		.replaceAll('&times;', '×')
		.replaceAll('&#39;', "'");
	return str;
}

/** Sanitizes input and returns valid name */
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

/**
 * Returns the keyword to use for the declaration depending on the root value
 */
function getDeclarationKeyword(root: boolean) {
	if (root) {
		return 'declare';
	} else {
		return 'export';
	}
}

/**
 * @param name must be the original, unsanitized name
 * @param isParam
 */
function getExportOverride(name: string, isParam: boolean) {
	if (isNameInvalid(name, isParam)) {
		return `export {${getName(name, isParam)} as ${name}}`;
	}
	return '';
}

function alphabetizeApi(a: ScriptApiEntry, b: ScriptApiEntry) {
	if (typeof a.name !== 'string' || typeof b.name !== 'string') {
		return 0;
	}
	if (a.name < b.name) {
		return -1;
	}
	if (a.name > b.name) {
		return 1;
	}
	return 0;
}

export {
	isAllUppercase,
	isApiTable,
	isApiFunc,
	isNameInvalid,
	isTypeDef,
	sanitizeForComment,
	getName,
	getDeclarationKeyword,
	getExportOverride,
	alphabetizeApi,
};
