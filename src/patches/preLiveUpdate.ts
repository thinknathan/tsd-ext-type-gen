export const preLiveUpdate = [
	{
		mode: 'replace',
		name: 'liveupdate',
		members: [
			{
				name: 'store_archive',
				parameters: [
					{
						name: 'options',
						fields: [
							{
								name: 'verify',
								type: 'boolean',
							},
						],
					},
				],
			},
		],
	},
] satisfies PatchEntry[];
