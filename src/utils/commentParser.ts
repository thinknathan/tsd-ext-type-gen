import { getName, sanitizeForComment } from './utils.js';

// Transforms and sanitizes descriptions
function getComments(entry: ScriptApiFunction) {
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

	// Replace `nil` with `undefined`
	if (newDesc.includes('`nil`')) {
		newDesc = newDesc.replaceAll('`nil`', '`undefined`');
	}

	// Replace `self` with `this`
	if (newDesc.includes('`self`')) {
		newDesc = newDesc.replaceAll('`self`', '`this`');
	}

	if (entry.examples) {
		// Comments for `@example`
		const exampleText = getExampleComments(entry.examples);
		if (exampleText.length > 0) {
			newDesc += `\n * @example ${exampleText}`;
		}
	}

	// Make sure the description doesn't break out of the comment
	return newDesc ? `/**\n * ${sanitizeForComment(newDesc)}\n */\n` : '';
}

function getReturnComments(
	returnObj: ScriptApiEntry | ScriptApiEntry[],
	newDesc: string,
) {
	let comments = '';

	if (Array.isArray(returnObj)) {
		// Add comments if they exist
		if (returnObj.some((ret) => ret.desc || ret.description)) {
			comments = `${returnObj.map((ret) => ret.desc || ret.description).join(' & ')}`;
		}
	} else if (returnObj.desc || returnObj.description) {
		comments = (returnObj.desc || returnObj.description) ?? '';
	}

	if (comments.length > 0) {
		newDesc += `\n * @returns ${comments}`;
	}

	return newDesc;
}

function getParamComments(parameters: ScriptApiParameter[], newDesc: string) {
	parameters.forEach((param) => {
		const name = getName(param.name ?? '', true);
		if (name) {
			newDesc += `\n * @param`;
			newDesc += ` ${name}`;

			const desc = param.desc || param.description;
			if (desc) {
				newDesc += ` ${desc}`;
			}

			if (param.fields && Array.isArray(param.fields)) {
				param.fields.forEach((subparam) => {
					newDesc += getSubParamComments(subparam);
				});
			}
			if (
				(param as ScriptApiTable).members &&
				Array.isArray((param as ScriptApiTable).members)
			) {
				(param as ScriptApiTable).members!.forEach((subparam) => {
					newDesc += getSubParamComments(subparam);
				});
			}
			if (
				(param as ScriptApiFunction).parameters &&
				Array.isArray((param as ScriptApiFunction).parameters)
			) {
				(param as ScriptApiFunction).parameters!.forEach((subparam) => {
					newDesc += getSubParamComments(subparam);
				});
			}
		}
	});
	return newDesc;
}

function getSubParamComments(
	subparam: ScriptApiParameter | ScriptApiEntry | ScriptApiTable,
) {
	const subDesc = subparam.desc || subparam.description;
	const subName = subparam.name ? getName(subparam.name, true) : '';
	const subType = Array.isArray(subparam.type)
		? subparam.type.join(', ')
		: subparam.type;
	if (subDesc) {
		return `\n * - ${subType ? `{${subType}}` : ''} ${subName ? `\`${subName}\` - ` : ''}${subDesc}`;
	}
	return '';
}

function getExampleComments(
	examples: string | ScriptApiExample | ScriptApiExample[],
) {
	let exampleText = '';
	if (Array.isArray(examples)) {
		examples.forEach((example) => {
			exampleText += getExampleComments(example);
		});
	} else if (typeof examples === 'object') {
		exampleText += examples.desc ?? examples.description ?? '';
	} else if (typeof examples === 'string') {
		exampleText += examples;
	}
	// Replace code
	exampleText = exampleText.replaceAll('<code>', '```lua\n');
	exampleText = exampleText.replaceAll('</code>', '```');
	return exampleText;
}

export { getComments };
