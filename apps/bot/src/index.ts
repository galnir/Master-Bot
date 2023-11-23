import { ExtendedClient } from './lib/structures/ExtendedClient';
import { env } from './env';
import { load } from '@lavaclient/spotify';
import {
	ApplicationCommandRegistries,
	RegisterBehavior
} from '@sapphire/framework';
import { ActivityType } from 'discord.js';
import Logger from './lib/logger';
import { notify } from './lib/twitch/notifyChannels';
import { trpcNode } from './trpc';

ApplicationCommandRegistries.setDefaultBehaviorWhenNotIdentical(
	RegisterBehavior.Overwrite
);

if (env.SPOTIFY_CLIENT_ID && env.SPOTIFY_CLIENT_SECRET) {
	load({
		client: {
			id: env.SPOTIFY_CLIENT_ID,
			secret: env.SPOTIFY_CLIENT_SECRET
		},
		autoResolveYoutubeTracks: true
	});
}

const client = new ExtendedClient();

client.on('ready', async () => {
	client.music.connect(client.user!.id);
	client.user?.setActivity('/', {
		type: ActivityType.Watching
	});

	client.user?.setStatus('online');
	const token = client.twitch.auth.access_token;
	if (!token) return;

	// happens to be the first DB call at start up
	try {
		const notifyDB = await trpcNode.twitch.getAll.query();

		const query: string[] = [];
		for (const user of notifyDB.notifications) {
			query.push(user.twitchId);
			client.twitch.notifyList[user.twitchId] = {
				sendTo: user.channelIds,
				logo: user.logo,
				live: user.live,
				messageSent: user.sent,
				messageHandler: {}
			};
		}
		await notify(query).then(() =>
			setInterval(async () => {
				const newQuery: string[] = [];
				// pickup newly added entries
				for (const key in client.twitch.notifyList) {
					newQuery.push(key);
				}
				await notify(newQuery);
			}, 60 * 1000)
		);
	} catch (err) {
		Logger.error('Prisma ' + err);
	}
});

client.on('chatInputCommandError', err => {
	console.log('Command Chat Input ' + err);
});
client.on('contextMenuCommandError', err => {
	console.log('Command Context Menu ' + err);
});
client.on('commandAutocompleteInteractionError', err => {
	console.log('Command Autocomplete ' + err);
});
client.on('commandApplicationCommandRegistryError', err => {
	console.log('Command Registry ' + err);
});
client.on('messageCommandError', err => {
	console.log('Command ' + err);
});
client.on('interactionHandlerError', err => {
	console.log('Interaction ' + err);
});
client.on('interactionHandlerParseError', err => {
	console.log('Interaction Parse ' + err);
});

client.on('listenerError', err => {
	console.log('Client Listener ' + err);
});

// LavaLink
client.music.on('error', err => {
	console.log('LavaLink ' + err);
});

const main = async () => {
	try {
		await client.login(env.DISCORD_TOKEN);
	} catch (error) {
		console.log('Bot errored out', error);
		client.destroy();
		process.exit(1);
	}
};

void main();
