export const preBuiltins = [
	{
		mode: 'replace',
		name: 'pprint',
		parameters: [
			{
				name: 'v',
				type: '...',
				spread: true,
			},
		],
	},
	{
		mode: 'add',
		name: 'hash',
		type: 'typeDef',
		typeDef: 'Readonly<LuaUserdata & { readonly __hash__: unique symbol; }>',
		desc: 'A unique identifier used to reference resources, messages, properties, and other entities within the game.',
	},
	{
		mode: 'add',
		name: 'url',
		type: 'typeDef',
		typeDef: '{ socket: hash; path: hash; fragment: hash | undefined; }',
		desc: 'A reference to game resources, such as game objects, components, and assets.',
	},
	{
		mode: 'add',
		name: 'node',
		type: 'typeDef',
		typeDef: 'Readonly<LuaUserdata & { readonly __node__: unique symbol; }>',
		desc: 'A representation of a GUI object.',
	},
	{
		mode: 'add',
		name: 'buffer',
		type: 'typeDef',
		typeDef: 'object',
		desc: 'A block of memory that can store binary data.',
	},
	{
		mode: 'add',
		name: 'bufferstream',
		type: 'typeDef',
		typeDef: 'LuaUserdata & number[] & object',
		desc: 'A data stream derived from a buffer.',
	},
] satisfies PatchEntry[];
