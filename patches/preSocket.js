export const preSocket = [
    {
        mode: 'replace',
        name: 'socket',
        members: [
            {
                name: '_VERSION',
                type: 'string',
            },
            {
                name: 'protect',
                parameters: [
                    {
                        name: 'func',
                        type: '(...args: any[]) => any',
                        useExactType: true,
                    },
                ],
                returns: {
                    type: '(...args: any[]) => LuaMultiReturn<[undefined, string]>',
                    useExactType: true,
                },
            },
            {
                name: 'newtry',
                parameters: [
                    {
                        name: 'finalizer',
                        type: '(...args: any[]) => any',
                        useExactType: true,
                    },
                ],
                returns: {
                    type: '(...args: any[]) => unknown',
                    useExactType: true,
                },
            },
        ],
    },
    {
        mode: 'add',
        name: 'socket',
        members: [
            {
                name: 'TCP',
                type: 'typeDef',
                typeDef: 'client & master & server',
            },
            {
                name: 'TCPReceivePattern',
                type: 'typeDef',
                typeDef: "number | '*a' | '*l'",
            },
            {
                name: 'TCPReceiveError',
                type: 'typeDef',
                typeDef: "'closed' | 'timeout'",
            },
            {
                name: 'TCPShutdownMode',
                type: 'typeDef',
                typeDef: "'both' | 'receive' | 'send'",
            },
            {
                name: 'TCPOptions',
                type: 'typeDef',
                typeDef: `| 'ipv6-v6only'
		| 'keepalive'
		| 'linger'
		| 'reuseaddr'
		| 'tcp-nodelay'`,
            },
            {
                name: 'TCPTimeoutMode',
                type: 'typeDef',
                typeDef: "'b' | 't'",
            },
            {
                name: 'UDP',
                type: 'typeDef',
                typeDef: 'connected & unconnected',
            },
            {
                name: 'UDPOptions',
                type: 'typeDef',
                typeDef: `| 'broadcast'
		| 'dontroute'
		| 'ip-add-membership'
		| 'ip-drop-membership'
		| 'ip-multicast-if'
		| 'ip-multicast-loop'
		| 'ip-multicast-ttl'
		| 'ipv6-v6only'
		| 'reuseaddr'
		| 'reuseport'`,
            },
        ],
    },
];
