#!/usr/bin/env node

import * as fs from 'fs';
import * as path from 'path';
import * as process from 'process';
import AdmZip from 'adm-zip';
import { parse } from 'yaml';
import yargs from 'yargs';

import { applyGlobalPatches } from './utils/patcher.js';
import { parseAll } from './utils/parser.js';
import { DEBUG, HEADER, HEADER_EXT, HEADER_GLOBAL } from './utils/constants.js';

/**
 * Main entry point
 */
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
		.option('m', {
			alias: 'mode',
			describe:
				'The parsing mode: "project" for locally installed Defold extensions or "global" for Defold engine API docs',
			type: 'string',
			default: 'project',
		})
		.option('r', {
			alias: 'release',
			describe: 'Used in "global" mode: "stable" or "beta" release channel',
			type: 'string',
			default: 'stable',
		})
		.parse();

	const project = argv.p;
	const outDir = argv.o;
	const mode = argv.m;
	const release = argv.r;

	if (mode === 'global') {
		await extractApiFromDefoldGlobal(release, outDir);
	} else if (mode === 'project') {
		await extractApiFromProject(project, outDir);
	}

	console.timeEnd('Done in');
	console.log(`Exported definitions to ${path.join(process.cwd(), outDir)}`);
}

/**
 * Parse project file to find dependencies and extract API from `script_api`
 */
async function extractApiFromProject(project: string, outDir: string) {
	// Find project file
	const absPath = path.join(process.cwd(), project);

	// Read project file
	let iniData = '';
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
				isExternalLuaModule: true,
				isGlobalDefApi: false,
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
					details.isExternalLuaModule = false;
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
			const apis: { [key: string]: ScriptApi } = {};
			try {
				files
					.filter((entry) => entry.name.endsWith('.script_api'))
					// Use a YAML parser to construction a JS object
					.forEach((entry) => {
						// Guess the name based on the script_api's filename
						apis[
							entry.name.split('.')[0] +
								`${depFilename ? '_' + depFilename : ''}`
						] = parse(entry.getData().toString('utf8')) as ScriptApi;
					});
			} catch (e) {
				console.error(e, dep);
				return;
			}

			await outputDefinitions(apis, outDir, dep, details);
		}),
	);
}

/**
 * Parse global Defold API
 */
async function extractApiFromDefoldGlobal(channel: string, outDir: string) {
	const info = (await fetch(`http://d.defold.com/${channel}/info.json`).then(
		(response) => response.json(),
	)) as DefoldInfo;

	const tag =
		channel === 'stable' ? `${info.version}` : `${info.version}-${channel}`;

	const ref = await fetch(
		`https://api.github.com/repos/defold/defold/git/ref/tags/${tag}`,
	);

	if (ref.status === 200) {
		const refInfo = (await ref.json()) as DefoldGitTag;
		const tagInfo = (await (
			await fetch(refInfo.object.url)
		).json()) as DefoldGitTag;
		info.sha1 = tagInfo.object.sha;
	}

	const req = await fetch(
		`http://d.defold.com/archive/${info.sha1}/engine/share/ref-doc.zip`,
	);
	if (req.status !== 200) {
		throw new Error(
			`Unable to download archive for ${info.version} (${info.sha1}): ${req.status}`,
		);
	}

	// Get a node-specific buffer from the request
	const zipBuffer = Buffer.from(await req.arrayBuffer());

	// Unzip file into memory
	const zip = new AdmZip(zipBuffer);
	if (!zip.test()) {
		console.error(`Zip archive damaged for ${info.version} (${info.sha1})`);
		return;
	}

	// Locate all files inside the zip
	const files = zip.getEntries();

	// Attempt to locate a `json` file to parse
	const apis: { [key: string]: ScriptApi } = {};
	try {
		files
			// Filter out non-json files
			// And remove a bunch of APIs unrelated to the Lua API
			.filter(
				(entry) =>
					entry.name.endsWith('.json') &&
					!entry.name.startsWith('script_bitop') &&
					!entry.name.startsWith('cs-dmsdk') &&
					!entry.name.startsWith('dmsdk') &&
					!entry.name.startsWith('engine') &&
					!entry.name.startsWith('editor') &&
					// Excludes standard Lua libraries, but includes luasocket
					!entry.name.startsWith('lua_') &&
					!entry.name.startsWith('proto'),
			)
			// Parse the JSON files
			.forEach((entry) => {
				const api = JSON.parse(
					entry.getData().toString('utf8'),
				) as JsonScriptApi;

				if (
					api &&
					api.info &&
					typeof api.info.namespace === 'string' &&
					Array.isArray(api.elements) &&
					api.elements.length > 0
				) {
					const namespace = api.info.namespace;

					if (namespace === 'builtins') {
						// Special case for builtins
						// They're not a member of a table: they're on the root
						const equivalentApi = api.elements.map(jsonToScriptApiEquivalent);
						if (apis[namespace] === undefined) {
							apis[namespace] = equivalentApi;
						} else {
							apis[namespace] = apis[namespace].concat(equivalentApi);
						}
					} else {
						// Remove periods from namespace name
						const displayName = namespace.split('.')[0];
						// Create a fake table for the members to belong to
						const equivalentApi = [
							{
								name: displayName,
								type: 'table',
								members: api.elements.map(jsonToScriptApiEquivalent),
							},
						] satisfies ScriptApiTable[];

						if (apis[namespace] === undefined) {
							apis[namespace] = equivalentApi;
						} else {
							// Merge members of duplicate namespaces
							const newMembers = equivalentApi[0].members ?? [];
							(apis[namespace][0] as ScriptApiTable).members = (
								apis[namespace][0] as ScriptApiTable
							).members!.concat(newMembers);
						}
					}
				}
			});
	} catch (e) {
		console.error(e);
		return;
	}

	await outputDefinitions(
		apis,
		outDir,
		`http://d.defold.com/archive/${info.sha1}/engine/share/ref-doc.zip`,
		{
			name: 'global',
			isExternalLuaModule: false,
			isGlobalDefApi: true,
			version: tag,
			sha: info.sha1,
		},
	);
}

/**
 * Makes the JSON API equivalent to the Script API equivalent
 * so they can be parsed by the same parser
 */
function jsonToScriptApiEquivalent(obj: JsonScriptApiEntry): ScriptApiEntry {
	// Look through each property in the object, and if that value is an array, recursively call this function
	if (typeof obj === 'object') {
		for (const key in obj) {
			if (Array.isArray(obj[key])) {
				obj[key] = jsonToScriptApiEquivalent(
					obj[key] as unknown as JsonScriptApiEntry,
				);
			} else if (typeof obj[key] === 'object') {
				obj[key] = jsonToScriptApiEquivalent(
					obj[key] as unknown as JsonScriptApiEntry,
				);
			}
		}
	}

	if (obj.name) {
		// Remove everything before the first period
		// Multiple periods may still be present
		if (obj.name.indexOf('.') !== -1) {
			obj.name = obj.name.substring(obj.name.indexOf('.') + 1);
		}
	}

	if (obj.returnvalues) {
		obj.returns = obj.returnvalues;
		delete obj.returnvalues;
	}
	if (obj.description) {
		obj.desc = obj.description;
		delete obj.description;
	}
	if (obj.doc) {
		obj.desc = obj.doc;
		delete obj.doc;
	}
	if (Array.isArray(obj.types)) {
		if (obj.types.length === 1) {
			if (typeof obj.types[0] === 'string' && obj.types[0].length > 0) {
				obj.type = obj.types[0];
			}
		} else if (obj.types.length > 1) {
			obj.type = obj.types.join('|');
		}

		delete obj.types;
	}
	if (obj.type === 'VARIABLE') {
		obj.type = 'CONSTANT';
	}
	if (obj.is_optional) {
		if (
			typeof obj.is_optional === 'string' &&
			obj.is_optional.length > 0 &&
			obj.is_optional !== 'False'
		) {
			obj.optional = true;
		}
		delete obj.is_optional;
	}
	if (typeof obj.examples === 'string' && obj.examples.length === 0) {
		delete obj.examples;
	}
	if (obj.members && Array.isArray(obj.members) && obj.members.length === 0) {
		delete obj.members;
	}
	if (
		obj.parameters &&
		Array.isArray(obj.parameters) &&
		obj.parameters.length === 0
	) {
		delete obj.parameters;
	}
	if (obj.returns && Array.isArray(obj.returns) && obj.returns.length === 0) {
		delete obj.returns;
	}

	delete obj.language;
	delete obj.tparams;
	delete obj.error;
	delete obj.brief;
	delete obj.replaces;
	delete obj.notes;

	return obj;
}

/** Parse API and generate TypeScript definitions, then write them to disk */
async function outputDefinitions(
	apis: { [key: string]: ScriptApi },
	outDir: string,
	dep: string,
	details: {
		name: string;
		isExternalLuaModule: boolean;
		isGlobalDefApi: boolean;
		version?: string;
		sha?: string;
	},
) {
	let globalCombinedApi = `${HEADER}${HEADER_GLOBAL}\n// Defold v${details.version ?? ''} (${details.sha ?? ''})\n\n`;
	const globalApis: { name: string; content: string }[] = [];
	for (const key in apis) {
		if (Object.prototype.hasOwnProperty.call(apis, key)) {
			// Set name according to key
			details.name = key;

			// Start processing api
			let api = apis[key];

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

			if (details.isGlobalDefApi) {
				// Special case where global API needs to be patched
				api = applyGlobalPatches(api, key);
			}

			// Turn our parsed object into definitions (string)
			const result = parseAll(api, details.isExternalLuaModule, true);

			if (result) {
				if (details.isGlobalDefApi) {
					globalApis.push({
						// Use name from details
						name: details.name,
						content: result,
					});
				} else {
					// Guess the source URL by including only the first 6 strings split by slash
					const depUrl = dep.split('/').slice(0, 5).join('/');

					// Append header
					const final = `${HEADER}${HEADER_EXT}/**\n * @see {@link ${depUrl}|Source}\n * @noResolution\n */\n${result}`;

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
			}
		}
	}
	if (details.isGlobalDefApi) {
		// Alphabetize the global API by name
		// Move `builtins` to the front of the array
		globalApis
			.sort((a, b) => a.name.localeCompare(b.name))
			.sort((x) => (x.name === 'builtins' ? -1 : 0));

		globalApis.forEach((api) => {
			globalCombinedApi += api.content + '\n\n';
		});
		// Save the definitions to file
		try {
			await fs.promises.writeFile(
				path.join(process.cwd(), outDir, 'index.d.ts'),
				globalCombinedApi,
			);
		} catch (e) {
			console.error(e, dep);
			return;
		}
	}
}

// Run the main function
void main();
