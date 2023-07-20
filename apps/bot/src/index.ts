import { ExtendedClient } from './lib/structures/ExtendedClient';

const client = new ExtendedClient();

client.on('ready', () => {
	console.log('Bot is ready!');
});

const main = async () => {
	try {
		await client.login(process.env.DISCORD_TOKEN);
	} catch (error) {
		console.log('error is', error);
		console.log('Bot errored out');
		client.destroy();
		process.exit(1);
	}
};

void main();
