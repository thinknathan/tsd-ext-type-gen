export const preHttp = [
	{
		mode: 'replace',
		name: 'http',
		members: [
			{
				name: 'request',
				parameters: [
					{
						name: 'headers',
						type: '{ [key: string]: string | number }',
						useExactType: true,
					},
					{
						name: 'options',
						fields: [
							{
								name: 'timeout',
								type: 'number',
								// @ts-expect-error adding to narrow type
								optional: true,
							},
							{
								name: 'path',
								type: 'string',
								// @ts-expect-error adding to narrow type
								optional: true,
							},
							{
								name: 'ignore_cache',
								type: 'boolean',
								// @ts-expect-error adding to narrow type
								optional: true,
							},
							{
								name: 'chunked_transfer',
								type: 'boolean',
								// @ts-expect-error adding to narrow type
								optional: true,
							},
							{
								name: 'report_progress',
								type: 'boolean',
								// @ts-expect-error adding to narrow type
								optional: true,
							},
						],
					},
				],
			},
		],
	},
] satisfies PatchEntry[];
