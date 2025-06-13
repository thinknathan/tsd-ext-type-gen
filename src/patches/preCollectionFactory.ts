export const preCollectionFactory = [
	{
		mode: 'replace',
		name: 'collectionfactory',
		members: [
			{
				name: 'create',
				returns: {
					type: 'LuaMap<hash, hash>',
					useExactType: true,
				},
			},
			{
				name: 'load',
				parameters: [
					{
						name: 'complete_function',
						type: 'function',
						parameters: [
							{
								name: 'this',
								type: 'any',
							},
							{
								name: 'url',
								type: 'url',
							},
							{
								name: 'result',
								type: 'boolean',
							},
						],
					},
				],
			},
		],
	},
] satisfies PatchEntry[];
