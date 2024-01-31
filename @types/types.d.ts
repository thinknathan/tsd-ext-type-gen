declare type ScriptDetails = {
	name: string;
	isLua: boolean;
};

declare type ScriptApi = Array<
	ScriptApiEntry | ScriptApiTable | ScriptApiFunction
>;

declare interface ScriptApiEntry {
	name?: string;
	type?: string | string[];
	desc?: string;
	description?: string; // This is a typo, but some people use it
}

declare interface ScriptApiTable extends ScriptApiEntry {
	members?: Array<ScriptApiEntry | ScriptApiFunction | ScriptApiTable>;
}

declare interface ScriptApiFunction extends ScriptApiEntry {
	parameters?: ScriptApiParameter[];
	return?: ScriptApiEntry | ScriptApiEntry[]; // This is a typo, but some people use it
	returns?: ScriptApiEntry | ScriptApiEntry[];
	examples?: ScriptApiExample[];
}

declare interface ScriptApiExample {
	desc?: string;
	description?: string; // This is a typo, but some people use it
}

declare interface ScriptApiParameter extends ScriptApiEntry {
	optional?: boolean;
	fields?: ScriptApiEntry[];
}
