export const preFactory = [
    {
        mode: 'replace',
        name: 'factory',
        members: [
            {
                name: 'load',
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
                                name: 'url',
                                type: 'url',
                            },
                            {
                                name: 'result',
                                type: 'boolean',
                            },
                        ],
                    },
                ],
            },
        ],
    },
];
