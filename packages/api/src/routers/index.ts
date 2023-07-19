import { createTRPCRouter } from "../trpc";
import { channelRouter } from "./channel";
import { commandRouter } from "./command";
import { guildRouter } from "./guild";
import { hubRouter } from "./hub";
import { playlistRouter } from "./playlist";
import { reminderRouter } from "./reminder";
import { songRouter } from "./song";
import { twitchRouter } from "./twitch";
import { userRouter } from "./user";
import { welcomeRouter } from "./welcome";

/**
 * Create your application's root router
 * If you want to use SSG, you need export this
 * @link https://trpc.io/docs/ssg
 * @link https://trpc.io/docs/router
 */

export const appRouter = createTRPCRouter({
  user: userRouter,
  guild: guildRouter,
  playlist: playlistRouter,
  song: songRouter,
  twitch: twitchRouter,
  channel: channelRouter,
  welcome: welcomeRouter,
  command: commandRouter,
  hub: hubRouter,
  reminder: reminderRouter,
});

export type AppRouter = typeof appRouter;
