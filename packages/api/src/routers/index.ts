import { initTRPC } from "@trpc/server";
import type { Context } from "../createContext";
import superjson from "superjson";
import { userRouter } from "./user";
import { guildRouter } from "./guild";
import { playlistRouter } from "./playlist";
import { songRouter } from "./song";
import { twitchRouter } from "./twitch";
import { channelRouter } from "./channel";
import { welcomeRouter } from "./welcome";
import { commandRouter } from "./command";
import { hubRouter } from "./hub";

export const t = initTRPC.context<Context>().create({
  transformer: superjson,
});

/**
 * Create your application's root router
 * If you want to use SSG, you need export this
 * @link https://trpc.io/docs/ssg
 * @link https://trpc.io/docs/router
 */

export const appRouter = t.router({
  user: userRouter,
  guild: guildRouter,
  playlist: playlistRouter,
  song: songRouter,
  twitch: twitchRouter,
  channel: channelRouter,
  welcome: welcomeRouter,
  command: commandRouter,
  hub: hubRouter,
});

export type AppRouter = typeof appRouter;
