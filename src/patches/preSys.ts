export const preSys = [
	{
		mode: 'replace',
		name: 'sys',
		members: [
			{
				name: 'load_buffer_async',
				parameters: [
					{
						name: 'path',
						type: 'string',
					},
					{
						name: 'status_callback',
						type: 'function',
						parameters: [
							{
								name: 'this',
								type: 'any',
							},
							{
								name: 'request_id',
								type: 'number',
							},
							{
								name: 'result',
								type: 'table',
								fields: [
									{
										name: 'status',
										type: 'number',
									},
									{
										name: 'buffer',
										type: 'buffer|nil',
									},
								],
							},
						],
					},
				],
			},
			{
				name: 'load_resource',
				returns: {
					type: 'LuaMultiReturn<[string | undefined, string | undefined]>',
					useExactType: true,
				},
			},
			{
				name: 'open_url',
				parameters: [
					{
						name: 'url',
						type: 'string',
					},
					{
						name: 'attributes',
						type: 'table',
						fields: [
							{
								name: 'target',
								type: 'string',
								// @ts-expect-error adding to narrow type
								optional: true,
							},
						],
					},
				],
			},
			{
				name: 'get_engine_info',
				returns: {
					type: 'table',
					desc: 'table with engine information',
					// @ts-expect-error adding to narrow type
					fields: [
						{
							name: 'version',
							type: 'string',
						},
						{
							name: 'version_sha1',
							type: 'string',
						},
						{
							name: 'is_debug',
							type: 'boolean',
						},
					],
				},
			},
			{
				name: 'get_application_info',
				returns: {
					type: 'table',
					// @ts-expect-error adding to narrow type
					fields: [
						{
							name: 'installed',
							type: 'boolean',
						},
					],
				},
			},
			{
				name: 'set_error_handler',
				parameters: [
					{
						name: 'error_handler',
						type: 'function',
						parameters: [
							{
								name: 'source',
								type: 'string',
							},
							{
								name: 'message',
								type: 'string',
							},
							{
								name: 'traceback',
								type: 'string',
							},
						],
					},
				],
			},
			{
				name: 'get_ifaddrs',
				returns: {
					type: '{ name: string, address: string | undefined, mac: string | undefined, up: boolean, running: boolean }[]',
					useExactType: true,
				},
			},
			{
				name: 'deserialize',
				returns: {
					type: 'unknown',
					useExactType: true,
				},
			},
			{
				name: 'load',
				returns: {
					type: 'unknown',
					useExactType: true,
				},
			},
			{
				name: 'get_sys_info',
				parameters: [
					{
						name: 'options',
						type: 'table',
						fields: [
							{
								name: 'ignore_secure',
								type: 'boolean',
							},
						],
					},
				],
				returns: {
					type: 'table',
					desc: 'table with system information',
					// @ts-expect-error adding to narrow type
					fields: [
						{
							name: 'device_model',
							type: 'string',
							optional: true,
						},
						{
							name: 'manufacturer',
							type: 'string',
							optional: true,
						},
						{
							name: 'system_name',
							type: 'string',
						},
						{
							name: 'system_version',
							type: 'string',
						},
						{
							name: 'api_version',
							type: 'string',
						},
						{
							name: 'language',
							type: 'string',
						},
						{
							name: 'device_language',
							type: 'string',
						},
						{
							name: 'territory',
							type: 'string',
						},
						{
							name: 'gmt_offset',
							type: 'number',
						},
						{
							name: 'device_ident',
							type: 'string',
							optional: true,
						},
						{
							name: 'user_agent',
							type: 'string',
							optional: true,
						},
					],
				},
			},
		],
	},
] satisfies PatchEntry[];
