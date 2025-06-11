export const preRender = [
    {
        mode: 'replace',
        name: 'render',
        members: [
            {
                name: 'constant_buffer',
                returns: {
                    type: 'constant_buffer',
                    useExactType: true,
                },
            },
            {
                name: 'render_target',
                parameters: [
                    {
                        name: 'parameters',
                        type: `{ [key: number]: {
							format: number,
							width: number,
							height: number,
							min_filter?: number,
							mag_filter?: number,
							u_wrap?: number,
							v_wrap?: number,
							flags?: number,
						} }`,
                        useExactType: true,
                    },
                ],
                returns: {
                    type: 'render_target',
                    useExactType: true,
                },
            },
            {
                name: 'delete_render_target',
                parameters: [
                    {
                        name: 'render_target',
                        type: 'render_target',
                        useExactType: true,
                    },
                ],
            },
            {
                name: 'set_render_target',
                parameters: [
                    {
                        name: 'render_target',
                        type: 'render_target',
                        useExactType: true,
                    },
                    {
                        name: 'options',
                        type: 'table',
                        fields: [
                            {
                                name: 'transient',
                                type: 'number[] | LuaSet<number>',
                                useExactType: true,
                            },
                        ],
                    },
                ],
            },
            {
                name: 'set_render_target_size',
                parameters: [
                    {
                        name: 'render_target',
                        type: 'render_target',
                        useExactType: true,
                    },
                ],
            },
            {
                name: 'get_render_target_width',
                parameters: [
                    {
                        name: 'render_target',
                        type: 'render_target',
                        useExactType: true,
                    },
                ],
            },
            {
                name: 'get_render_target_height',
                parameters: [
                    {
                        name: 'render_target',
                        type: 'render_target',
                        useExactType: true,
                    },
                ],
            },
            {
                name: 'clear',
                parameters: [
                    {
                        name: 'buffers',
                        type: `{ 
							[key: number]: vmath.vector4 | number
						}`,
                        useExactType: true,
                    },
                ],
            },
            {
                name: 'draw',
                parameters: [
                    {
                        name: 'options',
                        type: 'table',
                        fields: [
                            {
                                name: 'frustum',
                                type: 'vmath.matrix4',
                                // @ts-expect-error adding to narrow type
                                optional: true,
                            },
                            {
                                name: 'frustum_planes',
                                type: 'number',
                                // @ts-expect-error adding to narrow type
                                optional: true,
                            },
                            {
                                name: 'constants',
                                type: 'constant_buffer',
                                useExactType: true,
                                // @ts-expect-error adding to narrow type
                                optional: true,
                            },
                        ],
                    },
                ],
            },
            {
                name: 'dispatch_compute',
                parameters: [
                    {
                        name: 'options',
                        type: `table`,
                        fields: [
                            {
                                name: 'constants',
                                type: 'constant_buffer',
                                useExactType: true,
                            },
                        ],
                    },
                ],
            },
            {
                name: 'draw_debug3d',
                parameters: [
                    {
                        name: 'options',
                        type: `table`,
                        fields: [
                            {
                                name: 'frustum',
                                type: 'matrix4',
                                // @ts-expect-error adding to narrow type
                                optional: true,
                            },
                            {
                                name: 'frustum_planes',
                                type: 'int',
                                // @ts-expect-error adding to narrow type
                                optional: true,
                            },
                        ],
                    },
                ],
            },
            {
                name: 'predicate',
                parameters: [
                    {
                        name: 'tags',
                        type: `Array<hash | string>`,
                        useExactType: true,
                    },
                ],
            },
            {
                name: 'set_camera',
                parameters: [
                    {
                        name: 'options',
                        type: 'table',
                        fields: [
                            {
                                name: 'use_frustum',
                                type: 'boolean',
                            },
                        ],
                    },
                ],
            },
        ],
    },
    {
        mode: 'add',
        name: 'render',
        members: [
            {
                name: 'constant_buffer',
                type: 'typeDef',
                typeDef: '{ [key: string]: any }',
            },
            {
                name: 'render_target',
                type: 'typeDef',
                typeDef: 'LuaUserdata & { __brand: "render_target" }',
            },
        ],
    },
];
