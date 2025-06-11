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
        typeDef: 'Readonly<LuaUserdata & {	readonly __hash__: unique symbol;	}>',
    },
    {
        mode: 'add',
        name: 'url',
        type: 'typeDef',
        typeDef: '{	socket: hash;	path: hash;	fragment: hash | undefined; }',
    },
    {
        mode: 'add',
        name: 'node',
        type: 'typeDef',
        typeDef: 'Readonly<LuaUserdata & { readonly __node__: unique symbol; }>',
    },
    {
        mode: 'add',
        name: 'buffer',
        type: 'typeDef',
        typeDef: 'object',
    },
    {
        mode: 'add',
        name: 'bufferstream',
        type: 'typeDef',
        typeDef: 'LuaUserdata & number[] & object',
    },
];
