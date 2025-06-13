export const preBuffer = [
	{
		mode: 'replace',
		name: 'buffer',
		members: [
			{
				name: 'create',
				parameters: [
					{
						name: 'declaration',
						type: 'table',
						fields: [
							{
								name: 'hash',
								type: 'hash | string',
							},
							{
								name: 'type',
								type: 'constant',
							},
							{
								name: 'count',
								type: 'number',
							},
						],
					},
				],
			},
			{
				name: 'set_metadata',
				parameters: [
					{
						name: 'values',
						type: 'number[] | LuaSet<number>',
						useExactType: true,
					},
				],
			},
		],
	},
] satisfies PatchEntry[];
