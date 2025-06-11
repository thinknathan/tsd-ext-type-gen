export const preSprite = [
    // TO-DO: should these properties be in the namespace?
    // {
    // 	mode: 'add',
    // 	name: 'sprite',
    // 	members: [
    // 		{
    // 			type: 'vector3',
    // 			name: 'size',
    // 		},
    // 		{
    // 			type: 'vector4',
    // 			name: 'slice',
    // 		},
    // 		{
    // 			type: 'vector3',
    // 			name: 'scale',
    // 		},
    // 		{
    // 			type: 'hash',
    // 			name: 'image',
    // 		},
    // 		{
    // 			type: 'hash',
    // 			name: 'material',
    // 		},
    // 		{
    // 			type: 'number',
    // 			name: 'cursor',
    // 		},
    // 		{
    // 			type: 'number',
    // 			name: 'playback_rate',
    // 		},
    // 		{
    // 			type: 'hash',
    // 			name: 'animation',
    // 		},
    // 		{
    // 			type: 'number',
    // 			name: 'frame_count',
    // 		},
    // 	],
    // },
    {
        mode: 'replace',
        name: 'sprite',
        members: [
            {
                name: 'play_flipbook',
                type: 'function',
                parameters: [
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
                                        name: 'current_tile',
                                        type: 'number',
                                    },
                                    {
                                        name: 'id',
                                        type: 'hash',
                                    },
                                ],
                            },
                            { name: 'sender', type: 'url' },
                        ],
                    },
                    {
                        name: 'play_properties',
                        type: 'table',
                        fields: [
                            {
                                name: 'offset',
                                type: 'number',
                            },
                            {
                                name: 'playback_rate',
                                type: 'number',
                            },
                        ],
                    },
                ],
            },
        ],
    },
];
