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
		m01: number;
		m02: number;
		m03: number;
		m04: number;
		m11: number;
		m12: number;
		m13: number;
		m14: number;
		m21: number;
		m22: number;
		m23: number;
		m24: number;
		m31: number;
		m32: number;
		m33: number;
		m34: number;
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
		],
	},
] satisfies PatchEntry[];
