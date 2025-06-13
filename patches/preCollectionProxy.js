export const preCollectionProxy = [
    {
        mode: 'replace',
        name: 'collectionproxy',
        members: [
            {
                name: 'missing_resources',
                returns: {
                    type: 'string[]',
                    useExactType: true,
                },
            },
            {
                name: 'get_resources',
                returns: {
                    type: 'string[]',
                    useExactType: true,
                },
            },
        ],
    },
];
