import { initTRPC } from "@trpc/server";
import type { Context } from "./createContext";
import superjson from "superjson";

export const t = initTRPC.context<Context>().create({
  transformer: superjson,
});
