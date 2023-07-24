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
