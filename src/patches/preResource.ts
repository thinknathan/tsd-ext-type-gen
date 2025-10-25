export const preResource = [
	{
		mode: 'replace',
		name: 'resource',
		members: [
			{
				name: 'create_atlas',
				parameters: [
					{
						name: 'table',
						type: 'table',
						fields: [
							{
								name: 'texture',
								type: 'string|hash',
							},
							{
								name: 'animations',
								type: `{
												id: string;
												width: number;
												height: number;
												frame_start: number;
												frame_end: number;
												playback?: number;
												fps?: number;
												flip_vertical?: boolean;
												flip_horizontal?: boolean;
											}[]`,
								useExactType: true,
							},
							{
								name: 'geometries',
								type: `{
												id: string;
												width: number;
												height: number;
												pivot_x: number;
												pivot_y: number;
												rotated: boolean;
												vertices: number[] | LuaSet<number>;
												uvs: number[] | LuaSet<number>;
												indices: number[] | LuaSet<number>;
											}[]`,
								useExactType: true,
							},
						],
					},
				],
			},
			{
				name: 'create_texture_async',
				parameters: [
					{
						name: 'table',
						type: 'table',
						fields: [
							{
								name: 'type',
								type: 'number',
							},
							{
								name: 'width',
								type: 'number',
							},
							{
								name: 'height',
								type: 'number',
							},
							{
								name: 'depth',
								type: 'number',
							},
							{
								name: 'format',
								type: 'number',
							},
							{
								name: 'flags',
								type: 'number',
							},
							{
								name: 'max_mipmaps',
								type: 'number',
								// @ts-expect-error adding to narrow type
								optional: true,
							},
							{
								name: 'compression_type',
								type: 'number',
								// @ts-expect-error adding to narrow type
								optional: true,
							},
						],
					},
					// {
					// 	name: 'buffer',
					// 	optional: true,
					// },
					{
						name: 'callback',
						optional: true,
						type: '(this: any, request_id: number, resource: hash) => void',
						useExactType: true,
					},
				],
				returns: {
					// Fixes a docs issue introduced in Defold v1.10.0
					type: 'LuaMultiReturn<[hash, number]>',
					useExactType: true,
				},
			},
			{
				name: 'create_texture',
				parameters: [
					{
						name: 'table',
						type: 'table',
						fields: [
							{
								name: 'type',
								type: 'number',
							},
							{
								name: 'width',
								type: 'number',
							},
							{
								name: 'height',
								type: 'number',
							},
							{
								name: 'depth',
								type: 'number',
							},
							{
								name: 'format',
								type: 'number',
							},
							{
								name: 'flags',
								type: 'number',
							},
							{
								name: 'max_mipmaps',
								type: 'number',
								// @ts-expect-error adding to narrow type
								optional: true,
							},
							{
								name: 'compression_type',
								type: 'number',
								// @ts-expect-error adding to narrow type
								optional: true,
							},
						],
					},
					{
						name: 'buffer',
						optional: true,
					},
				],
			},
			{
				name: 'set_texture',
				parameters: [
					{
						name: 'table',
						type: 'table',
						fields: [
							{
								name: 'type',
								type: 'number',
							},
							{
								name: 'width',
								type: 'number',
							},
							{
								name: 'height',
								type: 'number',
							},
							{
								name: 'format',
								type: 'number',
							},
							{
								name: 'x',
								type: 'number',
								// @ts-expect-error adding to narrow type
								optional: true,
							},
							{
								name: 'y',
								type: 'number',
								// @ts-expect-error adding to narrow type
								optional: true,
							},
							{
								name: 'z',
								type: 'number',
								// @ts-expect-error adding to narrow type
								optional: true,
							},
							{
								name: 'page',
								type: 'number',
								// @ts-expect-error adding to narrow type
								optional: true,
							},
							{
								name: 'mipmap',
								type: 'number',
								// @ts-expect-error adding to narrow type
								optional: true,
							},
							{
								name: 'compression_type',
								type: 'number',
								// @ts-expect-error adding to narrow type
								optional: true,
							},
						],
					},
				],
			},
			{
				name: 'get_texture_info',
				returns: [
					{
						type: 'table',
						// @ts-expect-error adding to narrow type
						fields: [
							{
								name: 'handle',
								type: 'handle',
							},
							{
								name: 'width',
								type: 'number',
							},
							{
								name: 'height',
								type: 'number',
							},
							{
								name: 'depth',
								type: 'number',
							},
							{
								name: 'page_count',
								type: 'number',
							},
							{
								name: 'mipmaps',
								type: 'number',
							},
							{
								name: 'flags',
								type: 'number',
							},
							{
								name: 'type',
								type: 'number',
							},
						],
					},
				],
			},
			{
				name: 'get_render_target_info',
				returns: [
					{
						type: '{handle: number, attachments: { handle: number; width: number; height: number; depth: number; mipmaps: number; type: number, buffer_type: number, texture?: hash }}[]',
						useExactType: true,
					},
				],
			},
			{
				name: 'set_atlas',
				parameters: [
					{
						name: 'table',
						type: 'table',
						fields: [
							{
								name: 'texture',
								type: 'string | hash',
							},
							{
								name: 'animations',
								type: 'table',
								// @ts-expect-error adding to narrow type
								fields: [
									{
										name: 'id',
										type: 'string',
									},
									{
										name: 'width',
										type: 'number',
									},
									{
										name: 'height',
										type: 'number',
									},
									{
										name: 'frame_start',
										type: 'number',
									},
									{
										name: 'frame_end',
										type: 'number',
									},
									{
										name: 'playback',
										type: 'constant',
										optional: true,
									},
									{
										name: 'fps',
										type: 'number',
										optional: true,
									},
									{
										name: 'flip_vertical',
										type: 'boolean',
										optional: true,
									},
									{
										name: 'flip_horizontal',
										type: 'boolean',
										optional: true,
									},
								],
							},
							{
								name: 'geometries',
								type: '{ vertices: number[] | LuaSet<number>; uvs: number[] | LuaSet<number>; indices: number[] | LuaSet<number> }[]',
								useExactType: true,
							},
						],
					},
				],
			},
			{
				name: 'get_text_metrics',
				parameters: [
					{
						name: 'options',
						type: 'table',
						fields: [
							{
								name: 'width',
								type: 'number',
								// @ts-expect-error adding to narrow type
								optional: true,
							},
							{
								name: 'leading',
								type: 'number',
								// @ts-expect-error adding to narrow type
								optional: true,
							},
							{
								name: 'tracking',
								type: 'number',
								// @ts-expect-error adding to narrow type
								optional: true,
							},
							{
								name: 'line_break',
								type: 'boolean',
								// @ts-expect-error adding to narrow type
								optional: true,
							},
						],
					},
				],
				returns: [
					{
						type: 'table',
						// @ts-expect-error adding to narrow type
						fields: [
							{
								name: 'width',
								type: 'number',
							},
							{
								name: 'height',
								type: 'number',
							},
							{
								name: 'max_ascent',
								type: 'number',
							},
							{
								name: 'max_descent',
								type: 'number',
							},
						],
					},
				],
			},
			{
				name: 'set_buffer',
				parameters: [
					{
						name: 'table',
						fields: [
							{
								name: 'transfer_ownership',
								type: 'boolean',
								// @ts-expect-error adding to narrow type
								optional: true,
							},
						],
					},
				],
			},
			{
				name: 'create_buffer',
				parameters: [
					{
						name: 'table',
						fields: [
							{
								name: 'buffer',
								type: 'buffer',
							},
							{
								name: 'transfer_ownership',
								type: 'boolean',
								// @ts-expect-error adding to narrow type
								optional: true,
							},
						],
					},
				],
			},
			{
				name: 'create_sound_data',
				parameters: [
					{
						name: 'options',
						fields: [
							{
								name: 'data',
								type: 'string',
							},
							{
								name: 'filesize',
								type: 'number',
								// @ts-expect-error adding to narrow type
								optional: true,
							},
							{
								name: 'partial',
								type: 'boolean',
								// @ts-expect-error adding to narrow type
								optional: true,
							},
						],
					},
				],
			},
			{
				name: 'get_atlas',
				returns: [
					{
						type: 'table',
						// @ts-expect-error adding to narrow type
						fields: [
							{
								name: 'texture',
								type: 'string | hash',
							},
							{
								name: 'animations',
								type: 'table',
								fields: [
									{
										name: 'id',
										type: 'string',
									},
									{
										name: 'width',
										type: 'number',
									},
									{
										name: 'height',
										type: 'number',
									},
									{
										name: 'frame_start',
										type: 'number',
									},
									{
										name: 'frame_end',
										type: 'number',
									},
									{
										name: 'playback',
										type: 'constant',
										optional: true,
									},
									{
										name: 'fps',
										type: 'number',
										optional: true,
									},
									{
										name: 'flip_vertical',
										type: 'boolean',
										optional: true,
									},
									{
										name: 'flip_horizontal',
										type: 'boolean',
										optional: true,
									},
								],
							},
							{
								name: 'geometries',
								type: '{ vertices: number[] | LuaSet<number>; uvs: number[] | LuaSet<number>; indices: number[] | LuaSet<number> }[]',
								useExactType: true,
							},
						],
					},
				],
			},
		],
	},
] satisfies PatchEntry[];
