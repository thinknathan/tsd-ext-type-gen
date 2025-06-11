export const preJson = [
    {
        mode: 'replace',
        name: 'json',
        members: [
            {
                name: 'decode',
                parameters: [
                    {
                        name: 'options',
                        fields: [
                            {
                                name: 'decode_null_as_userdata',
                                type: 'boolean',
                            },
                        ],
                    },
                ],
                returns: {
                    type: 'unknown',
                    useExactType: true,
                },
            },
            {
                name: 'encode',
                parameters: [
                    {
                        name: 'options',
                        fields: [
                            {
                                name: 'encode_empty_table_as_object',
                                // Documentation incorrectly says string
                                type: 'boolean',
                            },
                        ],
                    },
                ],
            },
        ],
    },
];
