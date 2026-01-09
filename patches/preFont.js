export const preFont = [
    {
        mode: 'replace',
        name: 'font',
        members: [
            {
                name: 'get_info',
                returns: {
                    type: '{ path: hash, fonts: { path: string, path_hash: hash }[] }',
                    useExactType: true,
                },
            },
        ],
    },
];
