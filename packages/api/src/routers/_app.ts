/**
 * This file contains the root router of your tRPC-backend
 */
import superjson from "superjson";
import { createRouter } from "../createRouter";
import { userRouter } from "./user";
import { guildRouter } from "./guild";
import { playlistRouter } from "./playlist";

/**
 * Create your application's root router
 * If you want to use SSG, you need export this
 * @link https://trpc.io/docs/ssg
 * @link https://trpc.io/docs/router
 */
export const appRouter = createRouter()
  /**
   * Add data transformers
   * @link https://trpc.io/docs/data-transformers
   */
  .transformer(superjson)
  /**
   * Optionally do custom error (type safe!) formatting
   * @link https://trpc.io/docs/error-formatting
   */
  // .formatError(({ shape, error }) => { })
  .merge("user.", userRouter)
  .merge("guild.", guildRouter)
  .merge("playlist.", playlistRouter);

export type AppRouter = typeof appRouter;
