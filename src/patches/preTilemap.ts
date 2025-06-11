export const preTilemap = [
	{
		mode: 'replace',
		name: 'tilemap',
		members: [
			{
				name: 'get_tiles',
				returns: {
					type: '{ [key:number]: { [key:number]: number } }',
					useExactType: true,
				},
			},
			{
				name: 'get_tile_info',
				returns: {
					type: 'table',
					// @ts-expect-error adding to narrow type
					fields: [
						{
							name: 'index',
							type: 'number',
						},
						{
							name: 'h_flip',
							type: 'boolean',
						},
						{
							name: 'v_flip',
							type: 'boolean',
						},
						{
							name: 'rotate_90',
							type: 'boolean',
						},
					],
				},
			},
		],
	},
	// TO-DO: should these properties be in the namespace?
	// {
	// 	mode: 'add',
	// 	name: 'tilemap',
	// 	members: [
	// 		{
	// 			name: 'tile_source',
	// 			desc: 'The tile source used when rendering the tile map.',
	// 			type: 'hash',
	// 		},
	// 		{
	// 			name: 'material',
	// 			desc: 'The material used when rendering the tile map.',
	// 			type: 'hash',
	// 		},
	// 	],
	// },
] satisfies PatchEntry[];
