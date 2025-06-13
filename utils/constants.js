const DEBUG = false;
// Definitions file starts with this string
const HEADER = `/** @noSelfInFile */
/// <reference types="@typescript-to-lua/language-extensions" />`;
const HEADER_EXT = `\n/// <reference types="@ts-defold/types" />\n`;
const HEADER_GLOBAL = `\n/// <reference types="lua-types/5.1" />\n/// <reference types="lua-types/special/jit-only" />\n`;
// Invalid names in TypeScript
const INVALID_NAMES = [
    'any',
    'boolean',
    'break',
    'case',
    'catch',
    'class',
    'const',
    'continue',
    'debugger',
    'default',
    'delete',
    'do',
    'else',
    'enum',
    'export',
    'extends',
    'false',
    'finally',
    'for',
    'function',
    'if',
    'implements',
    'import',
    'in',
    'instanceof',
    'interface',
    'let',
    'new',
    'null',
    'package',
    'private',
    'protected',
    'public',
    'return',
    'static',
    'super',
    'switch',
    'throw',
    'true',
    'try',
    'typeof',
    'undefined',
    'var',
    'void',
    'while',
    'with',
    'yield',
];
// All valid types are listed here
const KNOWN_TYPES = {
    ANY: 'any',
    '...': 'any[]',
    TBL: 'object',
    TABLE: 'object',
    TABEL: 'object', // intentional typo
    OBJECT: 'object',
    MESSAGE: 'undefined',
    NUM: 'number',
    NUMBER: 'number',
    NUMMBER: 'number', // intentional typo
    INT: 'number',
    INTEGER: 'number',
    FLOAT: 'number',
    FLOATING: 'number',
    DOUBLE: 'number',
    STR: 'string',
    STRING: 'string',
    BOOL: 'boolean',
    BOOLEAN: 'boolean',
    FN: '(...args: any[]) => unknown',
    FUNC: '(...args: any[]) => unknown',
    FUNCTION: '(...args: any[]) => unknown',
    HASH: 'hash',
    URL: 'url',
    NODE: 'node',
    NIL: 'undefined',
    NILL: 'undefined', // intentional typo
    BUFFER: 'buffer',
    BUFFERSTREAM: 'bufferstream',
    VECTOR: 'ReturnType<typeof vmath.vector>',
    VECTOR3: 'vmath.vector3',
    VECTOR4: 'vmath.vector4',
    VECTO4: 'vmath.vector4', // intentional typo
    MATRIX: 'vmath.matrix4',
    MATRIX4: 'vmath.matrix4',
    QUAT: 'vmath.quaternion',
    QUATERNION: 'vmath.quaternion',
    QUATERTION: 'vmath.quaternion', // intentional typo
    'VMATH.VECTOR': 'vmath.vector',
    'VMATH.VECTOR3': 'vmath.vector3',
    'VMATH.VECTOR4': 'vmath.vector4',
    'VMATH.MATRIX4': 'vmath.matrix4',
    'VMATH.QUATERNION': 'vmath.quaternion',
    LUAUSERDATA: 'LuaUserdata',
    CONSTANT: 'number', // TO-DO: Handle `constant` (gameobject, gui_script, profiler, render_script, sys, buffer, collection_factory, factory, model, window)
    HANDLE: 'number', // TO-DO: Handle `handle` (render_script, camera)
    // TO-DO: Handle `constant_buffer` (render_script)
    // TO-DO: Handle `predicate` (render_script)
    // TO-DO: Handle `b2World`
    // TO-DO: Handle `b2BodyType`
    B2BODY: 'typeof b2d.body',
    // Socket library
    CLIENT: 'typeof socket.client',
    CONNECTED: 'typeof socket.connected',
    MASTER: 'typeof socket.master',
    SERVER: 'typeof socket.server',
    UNCONNECTED: 'typeof socket.unconnected',
};
const TYPES_TO_SKIP = ['MESSAGE', 'PROPERTY'];
// We'll make default return types slightly stricter than default param types
const DEFAULT_PARAM_TYPE = 'any';
const DEFAULT_RETURN_TYPE = 'unknown';
// Theoretically, it's impossible not to have a name, but just in case
const DEFAULT_NAME_IF_BLANK = 'missingName';
export { DEBUG, HEADER, HEADER_EXT, HEADER_GLOBAL, INVALID_NAMES, KNOWN_TYPES, TYPES_TO_SKIP, DEFAULT_PARAM_TYPE, DEFAULT_RETURN_TYPE, DEFAULT_NAME_IF_BLANK, };
