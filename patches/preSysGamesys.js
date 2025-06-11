export const preSysGamesys = [
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
        ],
    },
];
