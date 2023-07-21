import { ExtendedClient } from './lib/structures/ExtendedClient';
import { env } from './env';

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
