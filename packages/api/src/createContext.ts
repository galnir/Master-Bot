import * as trpc from "@trpc/server";
import * as trpcNext from "@trpc/server/adapters/next";
import { unstable_getServerSession as getServerSession } from "next-auth";
import { authOptions as nextAuthOptions } from "../../dashboard/src/pages/api/auth/[...nextauth]";
import { prisma } from "./db/client";
/**
 * Creates context for an incoming request
 * @link https://trpc.io/docs/context
 */
export const createContext = async (
  opts: trpcNext.CreateNextContextOptions
) => {
  // for API-response caching see https://trpc.io/docs/caching
  const session = await getServerSession(opts.req, opts.res, nextAuthOptions);
  return {
    session,
    prisma,
  };
};

export type Context = trpc.inferAsyncReturnType<typeof createContext>;
