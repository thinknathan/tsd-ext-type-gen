export const preB2d = [
	{
		mode: 'replace',
		name: 'b2d',
		members: [
			{
				name: 'get_body',
				returns: {
					type: 'typeof b2d.body | undefined',
					useExactType: true,
				},
			},
		],
	},
] satisfies PatchEntry[];
