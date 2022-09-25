import { initTRPC } from "@trpc/server";
import type { Context } from "./createContext";
import superjson from "superjson";

/**
 * Helper function to create a router with context
 */
export function createRouter() {
  return initTRPC.context<Context>().create({
    transformer: superjson,
  });
}
