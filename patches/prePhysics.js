export const prePhysics = [
    {
        mode: 'replace',
        name: 'physics',
        members: [
            {
                name: 'create_joint',
                parameters: [
                    {
                        name: 'properties',
                        type: '{ [key: string]: number | boolean | vmath.vector3 } | LuaMap<string, number | boolean | vmath.vector3>',
                        useExactType: true,
                    },
                ],
            },
            {
                name: 'raycast',
                returns: {
                    type: '{ fraction: number, position: vmath.vector3, normal: vmath.vector3, id: hash, group: hash, request_id: number } | undefined',
                    useExactType: true,
                },
                parameters: [
                    {
                        name: 'groups',
                        type: 'hash[] | LuaSet<hash>',
                        useExactType: true,
                    },
                    {
                        name: 'options',
                        type: 'table',
                        fields: [
                            {
                                name: 'all',
                                type: 'boolean',
                            },
                        ],
                    },
                ],
            },
            {
                name: 'get_joint_properties',
                returns: {
                    type: '{ [key: string]: number | boolean | vmath.vector3 }',
                    useExactType: true,
                },
            },
            {
                name: 'set_joint_properties',
                parameters: [
                    {
                        name: 'properties',
                        type: '{ [key: string]: number | boolean | vmath.vector3 } | LuaMap<string, number | boolean | vmath.vector3>',
                        useExactType: true,
                    },
                ],
            },
            {
                name: 'set_group',
                parameters: [
                    {
                        name: 'group',
                        type: 'hash | string',
                    },
                ],
            },
            {
                name: 'set_maskbit',
                parameters: [
                    {
                        name: 'group',
                        type: 'hash | string',
                    },
                ],
            },
            {
                name: 'raycast_async',
                parameters: [
                    {
                        name: 'groups',
                        type: 'hash[] | LuaSet<hash>',
                        useExactType: true,
                    },
                ],
            },
            {
                name: 'set_shape',
                parameters: [
                    {
                        name: 'table',
                        type: 'table',
                        fields: [
                            {
                                name: 'type',
                                type: 'constant',
                            },
                            {
                                name: 'diameter',
                                type: 'number',
                                // @ts-expect-error adding to narrow type
                                optional: true,
                            },
                            {
                                name: 'height',
                                type: 'number',
                                // @ts-expect-error adding to narrow type
                                optional: true,
                            },
                            {
                                name: 'dimensions',
                                type: 'vmath.vector3',
                                // @ts-expect-error adding to narrow type
                                optional: true,
                            },
                        ],
                    },
                ],
            },
            {
                name: 'get_shape',
                returns: {
                    type: 'table',
                    // @ts-expect-error adding to narrow type
                    fields: [
                        {
                            name: 'type',
                            type: 'constant',
                        },
                        {
                            name: 'diameter',
                            type: 'number',
                            optional: true,
                        },
                        {
                            name: 'height',
                            type: 'number',
                            optional: true,
                        },
                        {
                            name: 'dimensions',
                            type: 'vmath.vector3',
                            optional: true,
                        },
                    ],
                },
            },
        ],
    },
];
