export const preCrash = [
	{
		mode: 'replace',
		name: 'crash',
		members: [
			// TO-DO: This return type
			// {
			// 	name: 'get_backtrace',
			// 	returns: {
			// 		type: 'table',
			// 	},
			// },
			{
				name: 'get_modules',
				returns: {
					type: '{ name: unknown; address: unknown }[]',
					useExactType: true,
				},
			},
		],
	},
] satisfies PatchEntry[];
