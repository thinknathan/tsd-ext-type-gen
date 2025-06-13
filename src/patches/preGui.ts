export const preGui = [
	{
		mode: 'add',
		name: 'gui',
		members: [
			{
				name: 'final',
				type: 'typeDef',
				typeDef: '(this: any) => void',
			},
			{
				name: 'init',
				type: 'typeDef',
				typeDef: '(this: any) => void',
			},
			{
				name: 'update',
				type: 'typeDef',
				typeDef: '(this: any, dt: number) => void',
			},
			{
				name: 'on_message',
				type: 'typeDef',
				typeDef:
					'(this: any, message_id: hash, message: object, sender: url) => void',
			},
			{
				name: 'on_input',
				type: 'typeDef',
				typeDef:
					'(this: any, action_id: hash, action: go.input_message) => void',
			},
		],
	},
	{
		mode: 'replace',
		name: 'gui',
		members: [
			{
				name: 'animate',
				parameters: [
					{
						name: 'easing',
						type: 'number|vmath.vector3|vmath.vector4|vmath.quaternion|ReturnType<typeof vmath.vector>',
						useExactType: true,
					},
					{
						name: 'complete_function',
						type: 'function',
						parameters: [
							{
								name: 'this',
								type: 'any',
							},
							{
								name: 'node',
								type: 'node',
							},
						],
					},
				],
			},
			{
				name: 'play_flipbook',
				parameters: [
					{
						name: 'complete_function',
						type: 'function',
						parameters: [
							{
								name: 'this',
								type: 'any',
							},
							{
								name: 'node',
								type: 'node',
							},
						],
					},
					{
						name: 'play_properties',
						type: 'table',
						fields: [
							{
								name: 'offset',
								type: 'number',
								// @ts-expect-error adding to narrow type
								optional: true,
							},
							{
								name: 'playback_rate',
								type: 'number',
								// @ts-expect-error adding to narrow type
								optional: true,
							},
						],
					},
				],
			},
			{
				name: 'stop_particlefx',
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
			{
				name: 'get',
				returns: {
					type: 'unknown',
					useExactType: true,
				},
			},
		],
	},
] satisfies PatchEntry[];
