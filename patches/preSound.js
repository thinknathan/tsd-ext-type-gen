export const preSound = [
    {
        mode: 'replace',
        name: 'sound',
        members: [
            {
                name: 'get_groups',
                returns: [
                    {
                        type: 'hash[]',
                        useExactType: true,
                    },
                ],
            },
            {
                name: 'play',
                parameters: [
                    {
                        name: 'play_properties',
                        type: 'table',
                        fields: [
                            {
                                name: 'delay',
                                type: 'number',
                                // @ts-expect-error update type
                                optional: true,
                            },
                            {
                                name: 'gain',
                                type: 'number',
                                // @ts-expect-error update type
                                optional: true,
                            },
                            {
                                name: 'pan',
                                type: 'number',
                                // @ts-expect-error update type
                                optional: true,
                            },
                            {
                                name: 'speed',
                                type: 'number',
                                // @ts-expect-error update type
                                optional: true,
                            },
                        ],
                    },
                    {
                        name: 'complete_function',
                        type: 'function',
                        parameters: [
                            {
                                name: 'this',
                                type: 'any',
                            },
                            { name: 'message_id', type: 'hash' },
                            {
                                name: 'message',
                                type: 'table',
                                fields: [
                                    {
                                        name: 'play_id',
                                        type: 'number',
                                    },
                                ],
                            },
                            { name: 'sender', type: 'url' },
                        ],
                    },
                ],
            },
            {
                name: 'stop',
                parameters: [
                    {
                        name: 'stop_properties',
                        type: 'table',
                        fields: [
                            {
                                name: 'play_id',
                                type: 'ReturnType<typeof play>',
                                useExactType: true,
                            },
                        ],
                    },
                ],
            },
        ],
    },
];
