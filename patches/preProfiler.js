export const preProfiler = [
    {
        mode: 'replace',
        name: 'profiler',
        members: [
            {
                name: 'view_recorded_frame',
                parameters: [
                    {
                        name: 'frame_index',
                        type: 'table',
                        fields: [
                            {
                                name: 'distance',
                                type: 'number',
                                // @ts-expect-error adding to narrow type
                                optional: true,
                            },
                            {
                                name: 'frame',
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
