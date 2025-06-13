export const preMsg = [
	{
		mode: 'add',
		name: 'msg',
		members: [
			{
				name: 'generic_message',
				type: 'typeDef',
				typeDef: '{ [key: string|number]: unknown }',
			},
		],
	},
] satisfies PatchEntry[];
