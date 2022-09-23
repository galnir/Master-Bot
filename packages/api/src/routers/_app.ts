/**
 * This file contains the root router of your tRPC-backend
 */
import superjson from "superjson";
import { createRouter } from "../createRouter";
import { userRouter } from "./user";
import { guildRouter } from "./guild";
import { playlistRouter } from "./playlist";
import { songRouter } from "./song";
import { twitchRouter } from "./twitch";
import { channelRouter } from "./channel";
import { welcomeRouter } from "./welcome";
import { commandRouter } from "./command";
import { hubRouter } from "./hub";
import { reminderRouter } from "./reminder";

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
  .merge("playlist.", playlistRouter)
  .merge("song.", songRouter)
  .merge("twitch.", twitchRouter)
  .merge("channel.", channelRouter)
  .merge("welcome.", welcomeRouter)
  .merge("command.", commandRouter)
  .merge("hub.", hubRouter)
  .merge("reminder.", reminderRouter);

export type AppRouter = typeof appRouter;
