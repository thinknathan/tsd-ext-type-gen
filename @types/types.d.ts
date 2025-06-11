declare type ScriptDetails = {
	name: string;
	isExternalLuaModule: boolean;
};

declare type ScriptApi = Array<
	ScriptApiEntry | ScriptApiTable | ScriptApiFunction
>;

declare type JsonScriptApi = {
	elements: JsonScriptApiEntry[];
	info: {
		namespace: string;
	};
};

declare type JsonScriptApiEntry = {
	name?: string;
	returnvalues?: ScriptApiEntry[];
	description?: string;
	desc?: string;
	types?: string | string[];
	type?: string | string[];
	doc?: string;
	is_optional?: string;
	optional?: boolean;
	examples?: string;
	parameters?: ScriptApiParameter[];
	members?: ScriptApiEntry[];
	returns?: ScriptApiEntry[];
	language?: never;
	tparams?: never;
	error?: never;
	brief?: never;
	replaces?: never;
	notes?: never;
} & { [key: string]: unknown };

declare interface ScriptApiEntry {
	name?: string;
	type?: string | string[];
	desc?: string;
	description?: string; // This is a typo, but some people use it
	spread?: boolean; // Only used in custom patches
	useExactType?: boolean; // Only used in custom patches
	typeDef?: string; // Only used in custom patches
}

declare interface ScriptApiTable extends ScriptApiEntry {
	members?: Array<
		ScriptApiEntry | ScriptApiFunction | ScriptApiTable | PatchEntry
	>;
	fields?: Array<
		ScriptApiEntry | ScriptApiFunction | ScriptApiTable | PatchEntry
	>;
}

declare interface ScriptApiFunction extends ScriptApiEntry {
	parameters?: ScriptApiParameter[];
	return?: ScriptApiEntry | ScriptApiEntry[]; // This is a typo, but some people use it
	returns?: ScriptApiEntry | ScriptApiEntry[];
	examples?: ScriptApiExample[] | string;
}

declare interface ScriptApiExample {
	desc?: string;
	description?: string; // This is a typo, but some people use it
}

declare interface ScriptApiParameter extends ScriptApiEntry {
	optional?: boolean;
	fields?: ScriptApiEntry[];
	parameters?: ScriptApiParameter[];
}

declare interface DefoldInfo {
	version: string;
	sha1: string;
}

declare interface DefoldGitTag {
	ref?: string;
	tag?: string;
	object: {
		sha: string;
		url: string;
	};
}

declare type PatchEntry = {
	mode: 'add' | 'replace' | 'remove';
	name: string;
	typeDef?: string;
	spread?: boolean;
	useExactType?: boolean;
} & ScriptApiTable &
	ScriptApiFunction &
	ScriptApiParameter;

declare type PatchSchema = { [key: string]: PatchEntry[] };
