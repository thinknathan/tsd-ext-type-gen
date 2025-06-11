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
] satisfies PatchEntry[];
