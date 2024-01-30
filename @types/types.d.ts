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
	parameters?: Array<ScriptApiEntry & { optional?: boolean }>;
	return?: Partial<ScriptApiEntry>[];
	returns?: Partial<ScriptApiEntry>[];
	examples?: {
		desc: string;
	}[];
}
