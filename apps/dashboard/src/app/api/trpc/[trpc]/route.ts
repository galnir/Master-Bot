import { fetchRequestHandler } from '@trpc/server/adapters/fetch';
import { appRouter, createTRPCContext } from '@master-bot/api';

const handler = (req: Request) =>
	fetchRequestHandler({
		req,
		router: appRouter,
		endpoint: '/api/trpc',
		createContext: createTRPCContext
	});

export { handler as GET, handler as POST };
