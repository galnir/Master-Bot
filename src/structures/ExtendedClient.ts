import { SapphireClient } from '@sapphire/framework';
import { Intents } from 'discord.js';
import { QueueClient } from '../lib/utils/queue/QueueClient';
import * as data from '../config.json';
import Redis from 'ioredis';

export class ExtendedClient extends SapphireClient {
  readonly music: QueueClient;
  public constructor() {
    super({
      intents: [
        Intents.FLAGS.GUILDS,
        Intents.FLAGS.GUILD_MEMBERS,
        Intents.FLAGS.GUILD_MESSAGES,
        Intents.FLAGS.GUILD_VOICE_STATES
      ]
    });

    this.music = new QueueClient({
      sendGatewayPayload: (id, payload) =>
        this.guilds.cache.get(id)?.shard?.send(payload),
      options: { redis: new Redis() },
      connection: {
        host: data.lava_host,
        password: data.lava_pass,
        port: data.lava_port,
        secure: data.lava_secure
      }
    });
    this.ws.on('VOICE_SERVER_UPDATE', data => {
      this.music.handleVoiceUpdate(data);
    });
    this.ws.on('VOICE_STATE_UPDATE', data => {
      this.music.handleVoiceUpdate(data);
    });
  }
}

declare module '@sapphire/framework' {
  interface SapphireClient {
    readonly music: QueueClient;
    playerEmbeds: { [key: string]: string };
    leaveTimers: { [key: string]: NodeJS.Timer };
  }
}
