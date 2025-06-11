export const preTypes = [
    {
        mode: 'replace',
        name: 'types',
        members: [
            {
                name: 'is_vector',
                returns: {
                    type: 'var_ is vmath.vector',
                    useExactType: true,
                },
            },
            {
                name: 'is_matrix4',
                returns: {
                    type: 'var_ is vmath.matrix4',
                    useExactType: true,
                },
            },
            {
                name: 'is_vector3',
                returns: {
                    type: 'var_ is vmath.vector3',
                    useExactType: true,
                },
            },
            {
                name: 'is_vector4',
                returns: {
                    type: 'var_ is vmath.vector4',
                    useExactType: true,
                },
            },
            {
                name: 'is_quat',
                returns: {
                    type: 'var_ is vmath.quaternion',
                    useExactType: true,
                },
            },
            {
                name: 'is_hash',
                returns: {
                    type: 'var_ is hash',
                    useExactType: true,
                },
            },
            {
                name: 'is_url',
                returns: {
                    type: 'var_ is url',
                    useExactType: true,
                },
            },
        ],
    },
];
