import { channelRouter } from './routers/channel';
import { commandRouter } from './routers/command';
import { guildRouter } from './routers/guild';
import { hubRouter } from './routers/hub';
import { playlistRouter } from './routers/playlist';
import { reminderRouter } from './routers/reminder';
import { songRouter } from './routers/song';
import { twitchRouter } from './routers/twitch';
import { userRouter } from './routers/user';
import { welcomeRouter } from './routers/welcome';
import { createTRPCRouter } from './trpc';

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
	reminder: reminderRouter
});

// export type definition of API
export type AppRouter = typeof appRouter;
