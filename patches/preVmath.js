export const preVmath = [
    {
        mode: 'replace',
        name: 'vmath',
        members: [
            {
                name: 'vector',
                parameters: [
                    {
                        name: 't',
                        type: 'number[] | LuaSet<number>',
                        useExactType: true,
                    },
                ],
                returns: {
                    type: 'vector',
                    useExactType: true,
                },
            },
        ],
    },
    {
        mode: 'add',
        name: 'vmath',
        members: [
            {
                name: 'vector',
                type: 'typeDef',
                typeDef: 'number & { [key: number]: number }',
            },
            {
                name: 'vector3',
                type: 'typeDef',
                typeDef: `number & {
		/**
		 * Addition Operator for Vector3
		 * @see {@link https://typescripttolua.github.io/docs/advanced/language-extensions#operator-map-types|TSTL Docs}
		 */
		add: LuaAdditionMethod<vmath.vector3, vmath.vector3>;
		/**
		 * Subtraction Operator for Vector3
		 * @see {@link https://typescripttolua.github.io/docs/advanced/language-extensions#operator-map-types|TSTL Docs}
		 */
		sub: LuaSubtractionMethod<vmath.vector3, vmath.vector3>;
		/**
		 * Multiplication Operator for Vector3
		 * @see {@link https://typescripttolua.github.io/docs/advanced/language-extensions#operator-map-types|TSTL Docs}
		 */
		mul: LuaMultiplicationMethod<number, vmath.vector3>;
		/**
		 * Division Operator for Vector3
		 * @see {@link https://typescripttolua.github.io/docs/advanced/language-extensions#operator-map-types|TSTL Docs}
		 */
		div: LuaDivisionMethod<number, vmath.vector3>;
		/**
		 * Negation Operator for Vector3
		 * @see {@link https://typescripttolua.github.io/docs/advanced/language-extensions#operator-map-types|TSTL Docs}
		 */
		unm: LuaNegationMethod<vmath.vector3>;
		x: number;
		y: number;
		z: number;
	}`,
            },
            {
                name: 'vector4',
                type: 'typeDef',
                typeDef: `number & {
		/**
		 * Addition Operator for Vector4
		 * @see {@link https://typescripttolua.github.io/docs/advanced/language-extensions#operator-map-types|TSTL Docs}
		 */
		add: LuaAdditionMethod<vmath.vector4, vmath.vector4>;
		/**
		 * Subtraction Operator for Vector4
		 * @see {@link https://typescripttolua.github.io/docs/advanced/language-extensions#operator-map-types|TSTL Docs}
		 */
		sub: LuaSubtractionMethod<vmath.vector4, vmath.vector4>;
		/**
		 * Multiplication Operator for Vector4
		 * @see {@link https://typescripttolua.github.io/docs/advanced/language-extensions#operator-map-types|TSTL Docs}
		 */
		mul: LuaMultiplicationMethod<number, vmath.vector4>;
		/**
		 * Division Operator for Vector4
		 * @see {@link https://typescripttolua.github.io/docs/advanced/language-extensions#operator-map-types|TSTL Docs}
		 */
		div: LuaDivisionMethod<number, vmath.vector4>;
		/**
		 * Negation Operator for Vector4
		 * @see {@link https://typescripttolua.github.io/docs/advanced/language-extensions#operator-map-types|TSTL Docs}
		 */
		unm: LuaNegationMethod<vmath.vector4>;
		x: number;
		y: number;
		z: number;
		w: number;
	}`,
            },
            {
                name: 'matrix4',
                type: 'typeDef',
                typeDef: `number & {
		/**
			 * Multiplication Operator for Matrix4
			 * @see {@link https://typescripttolua.github.io/docs/advanced/language-extensions#operator-map-types|TSTL Docs}
			 */
		mul: LuaMultiplicationMethod<vmath.vector4, vmath.vector4> &
			LuaMultiplicationMethod<number, vmath.matrix4>;
		c0: vmath.vector4;
		c1: vmath.vector4;
		c2: vmath.vector4;
		c3: vmath.vector4;
		m00: number;
		m01: number;
		m02: number;
		m03: number;
		m10: number;
		m11: number;
		m12: number;
		m13: number;
		m20: number;
		m21: number;
		m22: number;
		m23: number;
		m30: number;
		m31: number;
		m32: number;
		m33: number;
	}`,
            },
            {
                name: 'quaternion',
                type: 'typeDef',
                typeDef: `number & {
		/**
			 * Multiplication Operator for Matrix4
			 * @see {@link https://typescripttolua.github.io/docs/advanced/language-extensions#operator-map-types|TSTL Docs}
			 */
		mul: LuaMultiplicationMethod<vmath.quaternion, vmath.quaternion>;
		x: number;
		y: number;
		z: number;
		w: number;
	}`,
            },
            /**
             * Add input/output type pairs as additional
             * override redefinitions
             */
            {
                name: 'normalize',
                type: 'function',
                noComment: true,
                parameters: [
                    {
                        name: 'v1',
                        type: 'vmath.vector3',
                        useExactType: true,
                    },
                ],
                returns: {
                    type: 'vmath.vector3',
                    useExactType: true,
                },
            },
            {
                name: 'normalize',
                type: 'function',
                noComment: true,
                parameters: [
                    {
                        name: 'v1',
                        type: 'vmath.vector4',
                        useExactType: true,
                    },
                ],
                returns: {
                    type: 'vmath.vector4',
                    useExactType: true,
                },
            },
            {
                name: 'normalize',
                type: 'function',
                noComment: true,
                parameters: [
                    {
                        name: 'v1',
                        type: 'vmath.quaternion',
                        useExactType: true,
                    },
                ],
                returns: {
                    type: 'vmath.quaternion',
                    useExactType: true,
                },
            },
            {
                name: 'normalize',
                type: 'function',
                noComment: true,
                parameters: [
                    {
                        name: 'v1',
                        type: 'vmath.vector',
                        useExactType: true,
                    },
                ],
                returns: {
                    type: 'vmath.vector',
                    useExactType: true,
                },
            },
            /**
             * Add input/output type pairs as additional
             * override redefinitions
             */
            {
                name: 'mul_per_elem',
                type: 'function',
                noComment: true,
                parameters: [
                    {
                        name: 'v1',
                        type: 'vmath.vector3',
                        useExactType: true,
                    },
                    {
                        name: 'v2',
                        type: 'vmath.vector3',
                        useExactType: true,
                    },
                ],
                returns: {
                    type: 'vmath.vector3',
                    useExactType: true,
                },
            },
            {
                name: 'mul_per_elem',
                type: 'function',
                noComment: true,
                parameters: [
                    {
                        name: 'v1',
                        type: 'vmath.vector4',
                        useExactType: true,
                    },
                    {
                        name: 'v2',
                        type: 'vmath.vector4',
                        useExactType: true,
                    },
                ],
                returns: {
                    type: 'vmath.vector4',
                    useExactType: true,
                },
            },
            /**
             * Add input/output type pairs as additional
             * override redefinitions
             */
            {
                name: 'clamp',
                type: 'function',
                noComment: true,
                parameters: [
                    {
                        name: 'value',
                        type: 'number',
                        useExactType: true,
                    },
                    {
                        name: 'min',
                        type: 'number | vmath.vector3 | vmath.vector4',
                        useExactType: true,
                    },
                    {
                        name: 'max',
                        type: 'number | vmath.vector3 | vmath.vector4',
                        useExactType: true,
                    },
                ],
                returns: {
                    type: 'number',
                    useExactType: true,
                },
            },
            {
                name: 'clamp',
                type: 'function',
                noComment: true,
                parameters: [
                    {
                        name: 'value',
                        type: 'vmath.vector3',
                        useExactType: true,
                    },
                    {
                        name: 'min',
                        type: 'number | vmath.vector3 | vmath.vector4',
                        useExactType: true,
                    },
                    {
                        name: 'max',
                        type: 'number | vmath.vector3 | vmath.vector4',
                        useExactType: true,
                    },
                ],
                returns: {
                    type: 'vmath.vector3',
                    useExactType: true,
                },
            },
            {
                name: 'clamp',
                type: 'function',
                noComment: true,
                parameters: [
                    {
                        name: 'value',
                        type: 'vmath.vector4',
                        useExactType: true,
                    },
                    {
                        name: 'min',
                        type: 'number | vmath.vector3 | vmath.vector4',
                        useExactType: true,
                    },
                    {
                        name: 'max',
                        type: 'number | vmath.vector3 | vmath.vector4',
                        useExactType: true,
                    },
                ],
                returns: {
                    type: 'vmath.vector4',
                    useExactType: true,
                },
            },
            /**
             * Add input/output type pairs as additional
             * override redefinitions
             */
            {
                name: 'slerp',
                type: 'function',
                noComment: true,
                parameters: [
                    {
                        name: 't',
                        type: 'number',
                        useExactType: true,
                    },
                    {
                        name: 'v1',
                        type: 'vmath.vector3',
                        useExactType: true,
                    },
                    {
                        name: 'v2',
                        type: 'vmath.vector3',
                        useExactType: true,
                    },
                ],
                returns: {
                    type: 'vmath.vector3',
                    useExactType: true,
                },
            },
            {
                name: 'slerp',
                type: 'function',
                noComment: true,
                parameters: [
                    {
                        name: 't',
                        type: 'number',
                        useExactType: true,
                    },
                    {
                        name: 'v1',
                        type: 'vmath.vector4',
                        useExactType: true,
                    },
                    {
                        name: 'v2',
                        type: 'vmath.vector4',
                        useExactType: true,
                    },
                ],
                returns: {
                    type: 'vmath.vector4',
                    useExactType: true,
                },
            },
        ],
    },
];
