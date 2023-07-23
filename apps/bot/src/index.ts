import { ExtendedClient } from './lib/structures/ExtendedClient';
import { env } from './env';
import { load } from '@lavaclient/spotify';
import {
	ApplicationCommandRegistries,
	RegisterBehavior
} from '@sapphire/framework';

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

client.on('ready', () => {
	console.log('Bot is ready!');
});

const main = async () => {
	try {
		await client.login(env.DISCORD_TOKEN);
	} catch (error) {
		console.log('Bot errored out');
		client.destroy();
		process.exit(1);
	}
};

void main();
