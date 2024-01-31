declare type ScriptDetails = {
	name: string;
	isLua: boolean;
};

declare type ScriptApi = Array<
	ScriptApiEntry | ScriptApiTable | ScriptApiFunction
>;

declare interface ScriptApiEntry {
	name: string;
	type: string | string[];
	desc?: string;
}

declare interface ScriptApiTable extends ScriptApiEntry {
	members: Array<ScriptApiEntry | ScriptApiFunction | ScriptApiTable>;
}

declare interface ScriptApiFunction extends ScriptApiEntry {
	parameters?: ScriptApiParameter[];
	return?: Partial<ScriptApiEntry> | Partial<ScriptApiEntry>[];
	returns?: Partial<ScriptApiEntry> | Partial<ScriptApiEntry>[];
	examples?: {
		desc: string;
	}[];
}

declare interface ScriptApiParameter extends ScriptApiEntry {
	optional?: boolean;
}
