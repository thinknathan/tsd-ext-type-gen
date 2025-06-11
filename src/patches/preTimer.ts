export const preTimer = [
	{
		mode: 'replace',
		name: 'timer',
		members: [
			{
				name: 'delay',
				parameters: [
					{
						name: 'callback',
						type: 'function',
						parameters: [
							{ name: 'this', type: 'any' },
							{ name: 'handle', type: 'handle' },
							{ name: 'time_elapsed', type: 'number' },
						],
					},
				],
			},
			{
				name: 'get_info',
				returns: [
					{
						type: 'undefined | { time_remaining: number, delay: number, repeating: boolean }',
						useExactType: true,
					},
				],
			},
		],
	},
] satisfies PatchEntry[];
