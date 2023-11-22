import { SapphireClient } from '@sapphire/framework';
import '@sapphire/plugin-hmr/register';
import { QueueClient } from '../music/classes/QueueClient';
import Redis from 'ioredis';
import { GatewayDispatchEvents, IntentsBitField } from 'discord.js';
import { deletePlayerEmbed } from '../music/buttonsCollector';

export class ExtendedClient extends SapphireClient {
	readonly music: QueueClient;
	leaveTimers: { [key: string]: NodeJS.Timeout };
	public constructor() {
		super({
			intents: [
				IntentsBitField.Flags.Guilds,
				IntentsBitField.Flags.GuildMembers,
				IntentsBitField.Flags.GuildMessages,
				IntentsBitField.Flags.GuildMessageReactions,
				IntentsBitField.Flags.GuildVoiceStates
			],
			logger: { level: 100 },
			loadMessageCommandListeners: true,
			hmr: {
				enabled: process.env.NODE_ENV === 'development'
			}
		});

		this.music = new QueueClient({
			sendGatewayPayload: (id, payload) =>
				this.guilds.cache.get(id)?.shard?.send(payload),
			options: {
				redis: new Redis({
					host: process.env.REDIS_HOST || 'localhost',
					port: Number.parseInt(process.env.REDIS_PORT!) || 6379,
					password: process.env.REDIS_PASSWORD || '',
					db: Number.parseInt(process.env.REDIS_DB!) || 0
				})
			},
			connection: {
				host: process.env.LAVA_HOST || '',
				password: process.env.LAVA_PASS || '',
				port: process.env.LAVA_PORT ? +process.env.LAVA_PORT : 1339,
				secure: process.env.LAVA_SECURE === 'true' ? true : false
			}
		});

		this.ws.on(GatewayDispatchEvents.VoiceServerUpdate, async data => {
			await this.music.handleVoiceUpdate(data);
		});

		this.ws.on(GatewayDispatchEvents.VoiceStateUpdate, async data => {
			// handle if a mod right-clicks disconnect on the bot
			if (!data.channel_id && data.user_id == this.application?.id) {
				const queue = this.music.queues.get(data.guild_id);
				await deletePlayerEmbed(queue);
				await queue.clear();
				queue.destroyPlayer();
			}
			await this.music.handleVoiceUpdate(data);
		});

		this.leaveTimers = {};
	}
}

declare module '@sapphire/framework' {
	interface SapphireClient {
		readonly music: QueueClient;
		leaveTimers: { [key: string]: NodeJS.Timeout };
	}
}

declare module 'lavaclient' {
	interface Player {
		nightcore: boolean;
		vaporwave: boolean;
		karaoke: boolean;
		bassboost: boolean;
	}
}
