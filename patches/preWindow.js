export const preWindow = [
    {
        mode: 'replace',
        name: 'window',
        members: [
            {
                name: 'set_listener',
                parameters: [
                    {
                        name: 'callback',
                        type: 'function',
                        parameters: [
                            { name: 'this', type: 'any' },
                            { name: 'event', type: 'constant' },
                            {
                                name: 'data',
                                type: 'table',
                                fields: [
                                    // @ts-expect-error adding to narrow type
                                    { name: 'width', type: 'number', optional: true },
                                    // @ts-expect-error adding to narrow type
                                    { name: 'height', type: 'number', optional: true },
                                ],
                            },
                        ],
                    },
                ],
            },
        ],
    },
    {
        mode: 'add',
        name: 'window',
        members: [
            {
                name: 'set_listener',
                type: 'function',
                desc: 'Pass `undefined` if you no longer wish to receive callbacks.',
                parameters: [
                    {
                        name: 'callback',
                        type: 'nil',
                    },
                ],
            },
        ],
    },
];
