#!/usr/bin/env node

import * as fs from 'fs';
import AdmZip from 'adm-zip';
import * as path from 'path';
import * as process from 'process';
import fetch from 'node-fetch';
import { parse } from 'yaml';
import yargs from 'yargs';

const DEBUG = false;

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
		console.error(e);
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
		console.error('Could not find dependencies in project file.');
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

			// Attempt to locate a `script_api` file to parse
			let api: ScriptApi = [];
			try {
				api = files
					.filter((entry) => entry.name.endsWith('.script_api'))
					// Use a YAML parser to construction a JS object
					.map<ScriptApi>((entry) => {
						// Guess the name based on the script_api's filename
						details.name = entry.name.split('.')[0];
						return parse(entry.getData().toString('utf8'));
					})[0];
			} catch (e) {
				console.error(e);
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
					console.error(e);
					return;
				}
			}

			// Turn our parsed object into definitions
			const result = generateTypeScriptDefinitions(api, details);

			if (result) {
				// Append header
				const final = HEADER + result;

				// Save the definitions to file
				try {
					await fs.promises.writeFile(
						path.join(process.cwd(), outDir, details.name + '.d.ts'),
						final,
					);
				} catch (e) {
					console.error(e);
					return;
				}
			}
		}),
	);

	console.timeEnd('Done in');
	console.log(`Exported definitions to ${path.join(process.cwd(), outDir)}`);
}

// Definitions file starts with this string
const HEADER = `/** @noSelfInFile */
/// <reference types="@typescript-to-lua/language-extensions" />
/// <reference types="@ts-defold/types" />
/** @noResolution */\n`;

// Invalid names in TypeScript
const INVALID_NAMES = [
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
	'export',
	'extends',
	'false',
	'finally',
	'for',
	'function',
	'if',
	'import',
	'in',
	'instanceof',
	'new',
	'null',
	'return',
	'super',
	'switch',
	'this',
	'throw',
	'true',
	'try',
	'typeof',
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

// Utility Functions

// Check if a string is all uppercase with optional underscores
function isAllUppercase(str: string): boolean {
	return /^[A-Z_]+$/.test(str);
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

// Sanitizes name
function getName(name: string) {
	let modifiedName = name.replace('...', 'args');
	// Check against the reserved keywords in TypeScript
	if (INVALID_NAMES.includes(modifiedName)) {
		console.warn(`Modifying invalid name ${modifiedName}`);
		modifiedName = modifiedName + '_';
	}
	modifiedName = modifiedName.replace(/[^a-zA-Z0-9_$]/g, '_');
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

// Transforms and sanitizes descriptions
function getComments(entry: ScriptApiFunction) {
	// Make sure the description doesn't break out of the comment
	let newDesc = entry.desc ? entry.desc.replace(/\*\//g, '') : '';
	// If params exist, let's create `@param`s in JSDoc format
	if (entry.parameters) {
		entry.parameters.forEach((param) => {
			const name = getName(param.name);
			if (name) {
				newDesc += `\n * @param `;
				if (param.type) {
					// Instead of getting a TS type here, use the raw Lua type
					let rawType = '';
					if (Array.isArray(param.type)) {
						// If multiple types, join them into a string
						rawType = param.type.join('|');
					} else {
						rawType = param.type;
					}
					// Sanitize type name
					rawType = rawType.replace(/[^a-zA-Z|0-9_$]/g, '_');
					newDesc += `{${rawType}} `;
				}
				newDesc += `${name} `;
				if (param.desc) {
					const sanitizedDesc = param.desc.replace(/\*\//g, '');
					newDesc += `${sanitizedDesc}`;
				}
			}
		});
	}
	return newDesc ? `/**\n * ${newDesc}\n */\n` : '';
}

// Main Functions

// Function to generate TypeScript definitions for ScriptApiTable
function generateTableDefinition(
	entry: ScriptApiTable,
	details: ScriptDetails,
	start = false,
): string {
	const name = getName(entry.name);
	let tableDeclaration = `export namespace ${name} {\n`;
	if (start) {
		tableDeclaration = details.isLua
			? `declare module '${name}.${name}' {\n`
			: `declare namespace ${name} {\n`;
	}

	return `${tableDeclaration}${generateTypeScriptDefinitions(entry.members, details)}\n}`;
}

// Function to generate TypeScript definitions for ScriptApiFunction
function generateFunctionDefinition(entry: ScriptApiFunction): string {
	const comment = getComments(entry);
	const parameters = entry.parameters
		? entry.parameters.map(getParameterDefinition).join(', ')
		: '';
	const returnType = getReturnType(entry.return || entry.returns);

	return `${comment}export function ${getName(entry.name)}(${parameters}): ${returnType};\n`;
}

function getParameterDefinition(
	param: ScriptApiEntry & { optional?: boolean },
): string {
	const name = getName(param.name);
	const optional = param.optional ? '?' : '';
	const type = getType(param.type, 'param');

	return `${name}${optional}: ${type}`;
}

function getReturnType(
	returnObj: Partial<ScriptApiEntry> | Partial<ScriptApiEntry>[] | undefined,
): string {
	if (!returnObj) {
		return 'void';
	}

	if (Array.isArray(returnObj)) {
		if (returnObj.length > 1) {
			return `LuaMultiReturn<[${returnObj.map((ret) => getType(ret.type, 'return')).join(', ')}]>`;
		} else {
			return `${returnObj.map((ret) => getType(ret.type, 'return')).join(', ')}`;
		}
	} else if (returnObj.type) {
		return getType(returnObj.type, 'return');
	} else {
		return 'void'; // Fallback in case we can't parse it at all
	}
}

// Function to generate TypeScript definitions for ScriptApiEntry
function generateEntryDefinition(entry: ScriptApiEntry): string {
	const name = getName(entry.name);
	const varType = isAllUppercase(name) ? 'const' : 'let';
	const type = getType(entry.type, 'return');
	const comment = getComments(entry);
	return `${comment}export ${varType} ${name}: ${type};\n`;
}

// Main function to generate TypeScript definitions for ScriptApi
function generateTypeScriptDefinitions(
	api: ScriptApi,
	details: ScriptDetails,
): string {
	let definitions = '';

	const namespaces: { [key: string]: ScriptApi } = {};

	api.forEach((entry) => {
		// Handle nested properties
		if (entry.name.includes('.')) {
			const namePieces = entry.name.split('.');
			const entryNamespace = namePieces[0];
			const entryName = namePieces[1];

			// Create namespace if not already exists
			namespaces[entryNamespace] = namespaces[entryNamespace] || [];

			// Update entry name and add to the namespace
			entry.name = entryName;
			namespaces[entryNamespace].push(entry);
		} else if (isApiTable(entry)) {
			definitions += generateTableDefinition(
				entry,
				details,
				definitions === '',
			);
		} else if (isApiFunc(entry)) {
			definitions += generateFunctionDefinition(entry);
		} else {
			definitions += generateEntryDefinition(entry);
		}
	});

	// Loop through namespaces
	for (const namespace in namespaces) {
		if (Object.prototype.hasOwnProperty.call(namespaces, namespace)) {
			const namespaceEntries = namespaces[namespace];

			definitions += `export namespace ${namespace} {\n`;

			// Loop through entries within the namespace
			namespaceEntries.forEach((entry) => {
				if (isApiTable(entry)) {
					definitions += generateTableDefinition(entry, details);
				} else if (isApiFunc(entry)) {
					definitions += generateFunctionDefinition(entry);
				} else {
					definitions += generateEntryDefinition(entry);
				}
			});

			definitions += '}\n';
		}
	}

	return definitions;
}

// Run the main function
main();
