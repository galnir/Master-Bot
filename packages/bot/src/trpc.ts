import type { AppRouter } from '@master-bot/api/src/routers/index';
import { createTRPCProxyClient } from '@trpc/client';
import { httpLink } from '@trpc/client/links/httpLink';
import { splitLink } from '@trpc/client/links/splitLink';
import { createWSClient, wsLink } from '@trpc/client/links/wsLink';
import superjson from 'superjson';
const _importDynamic = new Function('modulePath', 'return import(modulePath)');

const fetch = async function (...args: any) {
  const { default: fetch } = await _importDynamic('node-fetch');
  return fetch(...args);
};
import ws from 'ws';

const globalAny = global as any;
globalAny.fetch = fetch;
globalAny.WebSocket = ws;

const wsClient = createWSClient({
  url: `ws://localhost:2022`
});

export const trpcNode = createTRPCProxyClient<AppRouter>({
  transformer: superjson,
  links: [
    splitLink({
      condition(op) {
        return op.type === 'subscription';
      },
      true: wsLink({
        client: wsClient
      }),
      false: httpLink({
        url: 'http://localhost:3000/api/trpc'
      })
    })
  ]
});