import { preVmath } from '../patches/preVmath.js';
import { preWindow } from '../patches/preWindow.js';
import { preTypes } from '../patches/preTypes.js';
import { preTimer } from '../patches/preTimer.js';
import { preTilemap } from '../patches/preTilemap.js';
import { preSys } from '../patches/preSys.js';
import { preSprite } from '../patches/preSprite.js';
import { preSocket } from '../patches/preSocket.js';
import { preSound } from '../patches/preSound.js';
import { preBuiltins } from '../patches/preBuiltins.js';
import { preResource } from '../patches/preResource.js';
import { preRender } from '../patches/preRender.js';
import { preProfiler } from '../patches/preProfiler.js';
import { prePhysics } from '../patches/prePhysics.js';
import { preParticleFx } from '../patches/preParticleFx.js';
import { preModel } from '../patches/preModel.js';
import { preMsg } from '../patches/preMsg.js';
import { preLiveUpdate } from '../patches/preLiveUpdate.js';
import { preJson } from '../patches/preJson.js';
import { preImage } from '../patches/preImage.js';
import { preHttp } from '../patches/preHttp.js';
import { preGraphics } from '../patches/preGraphics.js';
import { preGui } from '../patches/preGui.js';
import { preGo } from '../patches/preGo.js';
import { preFont } from '../patches/preFont.js';
import { preFactory } from '../patches/preFactory.js';
import { preCrash } from '../patches/preCrash.js';
import { preCollectionProxy } from '../patches/preCollectionProxy.js';
import { preCollectionFactory } from '../patches/preCollectionFactory.js';
import { preCamera } from '../patches/preCamera.js';
import { preBuffer } from '../patches/preBuffer.js';
import { preB2d } from '../patches/preB2d.js';

const prePatches: PatchSchema = {
	b2d: preB2d,
	buffer: preBuffer,
	builtins: preBuiltins,
	camera: preCamera,
	collectionfactory: preCollectionFactory,
	collectionproxy: preCollectionProxy,
	crash: preCrash,
	factory: preFactory,
	font: preFont,
	go: preGo,
	graphics: preGraphics,
	gui: preGui,
	http: preHttp,
	image: preImage,
	json: preJson,
	liveupdate: preLiveUpdate,
	model: preModel,
	msg: preMsg,
	particlefx: preParticleFx,
	physics: prePhysics,
	profiler: preProfiler,
	render: preRender,
	resource: preResource,
	socket: preSocket,
	sound: preSound,
	sprite: preSprite,
	sys: preSys,
	tilemap: preTilemap,
	timer: preTimer,
	types: preTypes,
	vmath: preVmath,
	window: preWindow,
};

function recursiveMerge(
	entry: ScriptApiEntry | ScriptApiFunction | ScriptApiTable,
	patch: PatchEntry,
) {
	if (patch.desc) {
		entry.desc = patch.desc;
	}

	if (patch.type) {
		entry.type = patch.type;
	}

	if (patch.optional !== undefined) {
		(entry as ScriptApiParameter).optional = patch.optional;
	}

	if (patch.useExactType !== undefined) {
		entry.useExactType = patch.useExactType;
	}

	if (patch.returns) {
		// Special case: keep the old desc value if there is no replacement
		if (
			Array.isArray(patch.returns) &&
			Array.isArray((entry as ScriptApiFunction).returns)
		) {
			((entry as ScriptApiFunction).returns as ScriptApiEntry[]).forEach(
				(old, oldIndex) => {
					(patch.returns as ScriptApiEntry[]).forEach(
						(upd: ScriptApiEntry, updIndex: number) => {
							if (oldIndex === updIndex) {
								if (old.desc && !upd.desc) {
									(patch.returns as ScriptApiEntry[])[updIndex].desc = (
										(entry as ScriptApiFunction).returns as ScriptApiEntry[]
									)[updIndex].desc;
								}
							}
						},
					);
				},
			);
		}

		(entry as ScriptApiFunction).returns = patch.returns;
	}

	if (patch.spread !== undefined) {
		entry.spread = patch.spread;
	}

	// Recursively handle member tables
	if (patch.members) {
		if ((entry as ScriptApiTable).members) {
			(entry as ScriptApiTable).members!.map((old) => {
				patch.members!.map((upd) => {
					if (old.name === upd.name) {
						old = recursiveMerge(old, upd as PatchEntry);
					}
				});
				return old;
			});
		} else {
			(entry as ScriptApiTable).members = patch.members;
		}
	}

	// Recursively handle parameter tables
	if (patch.parameters) {
		if ((entry as ScriptApiFunction).parameters) {
			(entry as ScriptApiFunction).parameters!.map((old) => {
				patch.parameters!.map((upd) => {
					if (old.name === upd.name) {
						old = recursiveMerge(old, upd as PatchEntry);
					}
				});
				return old;
			});
		} else {
			(entry as ScriptApiFunction).parameters = patch.parameters;
		}
	}

	// Recursively handle fields tables
	if (patch.fields) {
		if ((entry as ScriptApiParameter).fields) {
			(entry as ScriptApiParameter).fields!.map((old) => {
				patch.fields!.map((upd) => {
					if (old.name === upd.name) {
						old = recursiveMerge(old, upd as PatchEntry);
					}
				});
				return old;
			});
		} else {
			(entry as ScriptApiParameter).fields = patch.fields;
		}
	}

	return entry;
}

/**
 * Iterate over each property in api, and if there is the same key in patch, merge the api with the property in patch
 * @param api
 * @param key
 * @returns
 */
export function applyGlobalPatches(api: ScriptApi, key: string) {
	if (prePatches[key]) {
		const patches = prePatches[key];
		patches.forEach((patch) => {
			if (patch.mode === 'add') {
				api.push(patch);
			} else if (patch.mode === 'remove') {
				api = api.filter((entry) => entry.name !== patch.name);
			} else {
				api.forEach((entry, index) => {
					api[index] = recursiveMerge(entry, patch);
				});
			}
		});
	}

	return api;
}
