import {
	KNOWN_TYPES,
	DEFAULT_PARAM_TYPE,
	DEFAULT_RETURN_TYPE,
} from './constants.js';

import { getName } from './utils.js';

/** Checks if the given string contains a function signature */
function isFunctionType(str: string): boolean {
	// Look for the word `function` and parenthesis
	return str.includes('function') && str.includes('(') && str.includes(')');
}

/** Check for pipe indicating a union type */
function isUnionType(str: string): boolean {
	return str.includes('|');
}

/** Transforms Lua/Defold type to valid TS type */
function getType(
	type: string | string[] | undefined,
	context: 'param' | 'return',
	useExactType: boolean | undefined,
): string {
	const defaultType =
		context === 'return' ? DEFAULT_RETURN_TYPE : DEFAULT_PARAM_TYPE;
	if (typeof type === 'string') {
		if (isUnionType(type)) {
			return parseUnionType(type, context, useExactType);
		} else if (useExactType) {
			// Don't transform the type
			return type;
		} else if (isFunctionType(type)) {
			return parseFunctionType(type, context);
		}
		return KNOWN_TYPES[type.toUpperCase()] ?? defaultType;
	} else if (Array.isArray(type)) {
		const typeSet = new Set<string>();
		type.forEach((rawType) => {
			typeSet.add(getType(rawType, context, useExactType));
		});
		const typeArray = Array.from(typeSet);
		return typeArray.length ? typeArray.join(' | ') : defaultType;
	}
	return defaultType;
}

function parseUnionType(
	type: string,
	context: 'param' | 'return',
	useExactType: boolean | undefined,
) {
	const types = type.split('|');

	// Trim
	const parsedTypes = types
		.map((atype) => atype.trim())
		// Parse each type
		.map((atype2) => getType(atype2, context, useExactType))
		.join(' | ');

	if (parsedTypes.length < 1) {
		console.error(`Invalid union type: ${type}`);
		return context === 'return' ? DEFAULT_RETURN_TYPE : DEFAULT_PARAM_TYPE;
	}

	return parsedTypes;
}

/**
 * Guess function signature based on the type (as a string)
 * Cannot determine types of the parameters
 */
function parseFunctionType(type: string, context: string) {
	// Remove whitespace
	type = type.trim();

	// Remove everything except the params
	type = type.replaceAll('function', '');
	type = type.replaceAll('(', '');
	type = type.replaceAll(')', '');

	// Remove whitespace again
	type = type.trim();

	if (type.length < 1) {
		return KNOWN_TYPES['FUNCTION'];
	}

	const types = type
		.split(',')
		// Trim
		.map((atype) => atype.trim())
		// Replace self with this
		.map((atype) => atype.replace(/^self$/, 'this'))
		// Sanitize names
		.map((atype) => getName(atype, true))
		// Add any type to each param
		.map((atype) => atype + ': any');

	const typesJoined = types.join(', ').trim();

	if (typesJoined.length < 1) {
		return KNOWN_TYPES['FUNCTION'];
	}

	if (context === 'return') {
		return `((${typesJoined}) => unknown)`;
	} else {
		return `((${typesJoined}) => void)`;
	}
}

export { getType };
