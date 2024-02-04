#!/usr/bin/env node

import * as fs from 'fs';
import * as os from 'os';
import * as path from 'path';
import * as process from 'process';
import AdmZip from 'adm-zip';
import fetch from 'node-fetch';
import { fileURLToPath } from 'url';
import { parse } from 'yaml';
import yargs from 'yargs';
import { Worker, parentPort, isMainThread } from 'worker_threads';

const DEBUG = true;

type TWorker = Worker & { isIdle: boolean };

async function main() {
	if (isMainThread) {
		/**
		 * Code run on the main thread
		 */
		console.time('Done in');

		/**
		 * Manages a pool of worker threads for parallel processing.
		 */
		class WorkerPool {
			private workers: TWorker[] = [];
			private taskQueue: { dep: string; outDir: string }[] = [];
			private maxWorkers: number;
			private completePromise?: Promise<void>;
			private completeResolve?: () => void;
			private isComplete(): boolean {
				return (
					this.taskQueue.length === 0 &&
					this.workers.every((worker) => worker.isIdle)
				);
			}
			private exitAll(): void {
				this.workers.forEach((worker) => worker.terminate());
			}

			/**
			 * Returns a promise that resolves when all work is done.
			 */
			public async allComplete(): Promise<void> {
				if (this.isComplete()) {
					return Promise.resolve();
				}

				if (!this.completePromise) {
					this.completePromise = new Promise<void>((resolve) => {
						this.completeResolve = resolve;
					});
				}

				return this.completePromise;
			}

			/**
			 * Creates a new WorkerPool instance.
			 */
			constructor(maxWorkers: number) {
				this.maxWorkers = maxWorkers;
			}

			/**
			 * Creates a worker thread for processing a specific file with given options.
			 */
			private createWorker(dep: string, outDir: string): void {
				const worker = new Worker(fileURLToPath(import.meta.url)) as TWorker;

				worker.postMessage({ dep, outDir });
				worker.isIdle = false;

				worker.on('message', () => {
					worker.isIdle = true;
					this.processNextTask();
				});

				worker.on('error', (err) => {
					console.error(`Error in worker for file ${dep}:`, err);
					worker.isIdle = true;
					this.processNextTask();
				});

				this.workers.push(worker);
				if (DEBUG) {
					console.log(`Creating worker #${this.workers.length}`);
				}
			}

			/**
			 * Processes the next task in the queue.
			 */
			private processNextTask(): void {
				const nextTask = this.taskQueue.shift();
				if (nextTask) {
					if (this.workers.length < this.maxWorkers) {
						this.createWorker(nextTask.dep, nextTask.outDir);
					} else {
						const worker = this.workers.find((w) => w.isIdle);
						if (worker) {
							worker.postMessage(nextTask);
						} else {
							// Something went wrong, there are no idle workers somehow
							throw Error('Could not find an idle worker.');
						}
					}
				} else if (this.isComplete()) {
					if (this.completeResolve) {
						this.completeResolve();
						this.completePromise = undefined;
						this.completeResolve = undefined;
					}
					this.exitAll();
				}
			}

			/**
			 * Adds a task to the worker pool for processing.
			 */
			public addTask(dep: string, outDir: string): void {
				if (this.workers.length < this.maxWorkers) {
					this.createWorker(dep, outDir);
				} else {
					this.taskQueue.push({ dep, outDir });
				}
			}
		}

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

		let numCores = 1;
		try {
			numCores = os.cpus().length;
		} catch (err) {
			console.error(err);
		}
		numCores = Math.min(numCores, deps.length); // Max #deps
		numCores = Math.max(numCores - 1, 1); // Min 1

		const workerPool = new WorkerPool(numCores);

		// Iterate over each dependency
		await Promise.all(
			deps.map((dep) => {
				workerPool.addTask(dep, outDir);
			}),
		);

		await workerPool.allComplete();

		console.timeEnd('Done in');
		console.log(`Exported definitions to ${path.join(process.cwd(), outDir)}`);
	} else {
		/**
		 * Code run in a worker thread
		 */

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
			'this',
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

		// Utility Functions

		// Check if a string is all uppercase with optional underscores
		const isAllUppercase = function (str: string): boolean {
			return /^[A-Z_]+$/.test(str);
		};

		// Check type of API entry
		const isApiTable = function (
			entry: ScriptApiTable | ScriptApiEntry | ScriptApiFunction,
		): entry is ScriptApiTable {
			return (
				(typeof entry.type === 'string' &&
					entry.type.toUpperCase() === 'TABLE') ||
				'members' in entry
			);
		};

		// Check type of API entry
		const isApiFunc = function (
			entry: ScriptApiTable | ScriptApiEntry | ScriptApiFunction,
		): entry is ScriptApiFunction {
			return (
				(typeof entry.type === 'string' &&
					entry.type.toUpperCase() === 'FUNCTION') ||
				'parameters' in entry
			);
		};

		// Sanitizes name
		const getName = function (name: string, isParam: boolean) {
			let modifiedName = String(name);

			// Check against the reserved keywords in TypeScript
			if (INVALID_NAMES.includes(modifiedName)) {
				modifiedName = modifiedName + '_';
			}

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
				console.warn(`Modifying invalid name "${name}" to "${modifiedName}"`);
			}

			return modifiedName;
		};

		// Transforms API type to TS type
		const getType = function (
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
		};

		const sanitizeForComment = function (str: string) {
			return str.replace(/\*\//g, '*\\/');
		};

		// Transforms and sanitizes descriptions
		const getComments = function (entry: ScriptApiFunction) {
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
		};

		const getReturnComments = function (
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
		};

		const getParamComments = function (
			parameters: ScriptApiParameter[],
			newDesc: string,
		) {
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
		};

		const getParamFields = function (
			fields: ScriptApiEntry[],
			newDesc: string,
		) {
			fields.forEach((field) => {
				newDesc += ` ${JSON.stringify(field)}`;
			});
			return newDesc;
		};

		const getExampleComments = function (
			examples: ScriptApiExample[],
			newDesc: string,
		) {
			examples.forEach((example) => {
				const desc = example.desc || example.description;
				if (desc) {
					newDesc += `\n * @example ${desc}`;
				}
			});
			return newDesc;
		};

		// Main Functions

		// Function to generate TypeScript definitions for ScriptApiTable
		const generateTableDefinition = function (
			entry: ScriptApiTable,
			details: ScriptDetails,
			start = false,
		): string {
			const name = entry.name
				? getName(entry.name, false)
				: DEFAULT_NAME_IF_BLANK;
			let tableDeclaration = `export namespace ${name} {\n`;
			if (start) {
				tableDeclaration = details.isLua
					? `declare module '${name}.${name}' {\n`
					: `declare namespace ${name} {\n`;
			}

			if (entry.members && Array.isArray(entry.members)) {
				return `${tableDeclaration}${generateTypeScriptDefinitions(entry.members, details)}}`;
			} else {
				return `${tableDeclaration}}`;
			}
		};

		// Function to generate TypeScript definitions for ScriptApiFunction
		const generateFunctionDefinition = function (
			entry: ScriptApiFunction,
			isParam: boolean,
		): string {
			const parameters = entry.parameters
				? entry.parameters.map(getParameterDefinition).join(', ')
				: '';
			const returnType = getReturnType(entry.return || entry.returns);

			if (isParam) {
				return `(${parameters}) => ${returnType}`;
			} else {
				const comment = getComments(entry);
				const name = entry.name
					? getName(entry.name, false)
					: DEFAULT_NAME_IF_BLANK;
				return `${comment}export function ${name}(${parameters}): ${returnType};\n`;
			}
		};

		const getParameterDefinition = function (
			param: ScriptApiParameter,
		): string {
			const name = param.name
				? getName(param.name, true)
				: DEFAULT_NAME_IF_BLANK;
			const optional = param.optional ? '?' : '';
			let type = getType(param.type, 'param');

			if (type === KNOWN_TYPES['FUNCTION']) {
				// Get a more specific function signature
				type = generateFunctionDefinition(param, true);
			} else if (
				type === KNOWN_TYPES['TABLE'] &&
				param.fields &&
				Array.isArray(param.fields)
			) {
				// Try to get the exact parameters of a table
				type = `{ ${param.fields.map(getParameterDefinition).join('; ')} }`;
			}
			return `${name}${optional}: ${type}`;
		};

		const getReturnType = function (
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
		};

		// Function to generate TypeScript definitions for ScriptApiEntry
		const generateEntryDefinition = function (entry: ScriptApiEntry): string {
			const name = entry.name
				? getName(entry.name, false)
				: DEFAULT_NAME_IF_BLANK;
			const varType = isAllUppercase(name) ? 'const' : 'let';
			const type = getType(entry.type, 'return');
			const comment = getComments(entry);
			return `${comment}export ${varType} ${name}: ${type};\n`;
		};

		// Main function to generate TypeScript definitions for ScriptApi
		const generateTypeScriptDefinitions = function (
			api: ScriptApi,
			details: ScriptDetails,
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
					definitions += generateTableDefinition(
						entry,
						details,
						definitions === '',
					);
				} else if (isApiFunc(entry)) {
					definitions += generateFunctionDefinition(entry, false);
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
							definitions += generateFunctionDefinition(entry, false);
						} else {
							definitions += generateEntryDefinition(entry);
						}
					});

					definitions += '}\n';
				}
			}

			return definitions;
		};

		const workIsDone = () => parentPort?.postMessage('complete');

		parentPort?.on(
			'message',
			async (message: { dep: string; outDir: string }) => {
				const { dep, outDir } = message;

				const details = {
					name: '', // We'll guess the name later
					isLua: true,
				};

				// Fetch dependency zip file
				const req = await fetch(dep);
				if (!req.ok) {
					console.error(`Failed to fetch dependency ${dep}`);
					workIsDone();
					return;
				}

				// Get a node-specific buffer from the request
				const zipBuffer = Buffer.from(await req.arrayBuffer());

				// Unzip file into memory
				const zip = new AdmZip(zipBuffer);
				if (!zip.test()) {
					console.error(`Zip archive damaged for ${dep}`);
					workIsDone();
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
					console.error(e, dep);
					workIsDone();
					return;
				}

				// If we have no API to parse, exit early
				if (!api || api.length === 0) {
					workIsDone();
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
						workIsDone();
						return;
					}
				}

				// Turn our parsed object into definitions
				const result = generateTypeScriptDefinitions(api, details);

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
						workIsDone();
						return;
					}
				}
				workIsDone();
			},
		);
	}
}

// Run the main function
main();
