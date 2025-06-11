export const preImage = [
	{
		mode: 'replace',
		name: 'json',
		members: [
			{
				name: 'load',
				parameters: [
					{
						name: 'options',
						fields: [
							{
								name: 'premultiply_alpha',
								type: 'boolean',
								// @ts-expect-error adding to narrow type
								optional: true,
							},
							{
								name: 'flip_vertically',
								type: 'boolean',
								// @ts-expect-error adding to narrow type
								optional: true,
							},
						],
					},
				],
				returns: {
					type: `{
						width: number;
						height: number;
						type: number;
						buffer: string;
					} | undefined`,
					useExactType: true,
				},
			},
			{
				name: 'load_buffer',
				parameters: [
					{
						name: 'options',
						fields: [
							{
								name: 'premultiply_alpha',
								type: 'boolean',
								// @ts-expect-error adding to narrow type
								optional: true,
							},
							{
								name: 'flip_vertically',
								type: 'boolean',
								// @ts-expect-error adding to narrow type
								optional: true,
							},
						],
					},
				],
				returns: {
					type: `{
						width: number;
						height: number;
						type: number;
						buffer: string;
					} | undefined`,
					useExactType: true,
				},
			},
		],
	},
] satisfies PatchEntry[];
