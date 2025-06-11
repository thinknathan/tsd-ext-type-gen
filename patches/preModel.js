export const preModel = [
    {
        mode: 'replace',
        name: 'model',
        members: [
            {
                name: 'get_aabb',
                returns: {
                    type: 'table',
                    // @ts-expect-error adding to narrow type
                    fields: [
                        {
                            name: 'min',
                            type: 'vmath.vector3',
                        },
                        {
                            name: 'max',
                            type: 'vmath.vector3',
                        },
                    ],
                },
            },
            {
                name: 'get_mesh_aabb',
                returns: {
                    type: 'LuaMap<hash, { min: vmath.vector3, max: vmath.vector3 }>[]',
                    useExactType: true,
                },
            },
            {
                name: 'play_anim',
                parameters: [
                    {
                        name: 'play_properties',
                        type: 'table',
                        fields: [
                            {
                                name: 'blend_duration',
                                type: 'number',
                                // @ts-expect-error adding to narrow type
                                optional: true,
                            },
                            {
                                name: 'offset',
                                type: 'number',
                                // @ts-expect-error adding to narrow type
                                optional: true,
                            },
                            {
                                name: 'playback_rate',
                                type: 'number',
                                // @ts-expect-error adding to narrow type
                                optional: true,
                            },
                        ],
                    },
                ],
            },
        ],
    },
];
