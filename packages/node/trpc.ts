import type { AppRouter } from "@master-bot/api/src/routers/_app";
import { createTRPCClient } from "@trpc/client";
import superjson from "superjson";

export const trpcNode = createTRPCClient<AppRouter>({
  url: "http://localhost:3000/api/trpc",
  transformer: superjson,
});
