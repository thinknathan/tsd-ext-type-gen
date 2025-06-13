export const preGo = [
    {
        mode: 'add',
        name: 'go',
        members: [
            {
                name: 'touch_input',
                type: 'typeDef',
                typeDef: `{
		id: number;
		pressed: boolean;
		released: boolean;
		tap_count: number;
		x: number;
		y: number;
		dx: number;
		dy: number;
		acc_x?: number;
		acc_y?: number;
		acc_z?: number;
	}`,
            },
            {
                name: 'input_message',
                type: 'typeDef',
                typeDef: `{
		value?: number;
		pressed?: boolean;
		released?: boolean;
		repeated?: boolean;
		x?: number;
		y?: number;
		screen_x?: number;
		screen_y?: number;
		dx?: number;
		dy?: number;
		screen_dx?: number;
		screen_dy?: number;
		gamepad?: number;
		touch?: touch_input[];
	}`,
            },
            {
                name: 'final',
                type: 'typeDef',
                typeDef: '(this: any) => void',
            },
            {
                name: 'fixed_update',
                type: 'typeDef',
                typeDef: '(this: any, dt: number) => void',
            },
            {
                name: 'init',
                type: 'typeDef',
                typeDef: '(this: any) => void',
            },
            {
                name: 'update',
                type: 'typeDef',
                typeDef: '(this: any, dt: number) => void',
            },
            {
                name: 'on_message',
                type: 'typeDef',
                typeDef: '(this: any, message_id: hash, message: object, sender: url) => void',
            },
            {
                name: 'on_input',
                type: 'typeDef',
                typeDef: '(this: any, action_id: hash, action: go.input_message) => void',
            },
        ],
    },
    {
        mode: 'replace',
        name: 'go',
        members: [
            {
                name: 'animate',
                parameters: [
                    {
                        name: 'easing',
                        type: 'number|vmath.vector3|vmath.vector4|vmath.quaternion|ReturnType<typeof vmath.vector>',
                        useExactType: true,
                    },
                ],
            },
            {
                name: 'get',
                returns: {
                    type: 'unknown',
                    useExactType: true,
                },
            },
        ],
    },
];
