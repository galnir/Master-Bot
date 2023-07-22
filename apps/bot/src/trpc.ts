import type { AppRouter } from '@master-bot/api/index';
import { createTRPCProxyClient, httpBatchLink } from '@trpc/client';
import superjson from 'superjson';
import ws from 'ws';
// @ts-ignore
import * as trpcServer from '@trpc/server';
const _importDynamic = new Function('modulePath', 'return import(modulePath)');

const fetch = async function (...args: any) {
	const { default: fetch } = await _importDynamic('node-fetch');
	return fetch(...args);
};

const globalAny = global as any;
globalAny.fetch = fetch;
globalAny.WebSocket = ws;

export const trpcNode = createTRPCProxyClient<AppRouter>({
	links: [
		httpBatchLink({
			url: 'http://localhost:3000/api/trpc'
		})
	],
	transformer: superjson
});
