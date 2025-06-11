export const preParticleFx = [
	{
		mode: 'replace',
		name: 'particlefx',
		members: [
			{
				name: 'stop',
				parameters: [
					{
						name: 'options',
						type: 'table',
						fields: [
							{
								name: 'clear',
								type: 'boolean',
							},
						],
					},
				],
			},
		],
	},
] satisfies PatchEntry[];
