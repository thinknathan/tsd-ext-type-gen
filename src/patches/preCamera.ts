export const preCamera = [
	{
		mode: 'replace',
		name: 'camera',
		members: [
			{
				name: 'get_cameras',
				returns: {
					type: 'url[]',
					useExactType: true,
				},
			},
		],
	},
] satisfies PatchEntry[];
