import { SapphireClient } from '@sapphire/framework';
import { Intents } from 'discord.js';
import { Node } from 'lavaclient';
import * as data from '../config.json';

export class ExtendedClient extends SapphireClient {
  readonly music: Node;

  public constructor() {
    super({
      intents: [
        Intents.FLAGS.GUILDS,
        Intents.FLAGS.GUILD_MEMBERS,
        Intents.FLAGS.GUILD_MESSAGES,
        Intents.FLAGS.GUILD_VOICE_STATES
      ]
    });

    this.music = new Node({
      sendGatewayPayload: (id, payload) =>
        this.guilds.cache.get(id)?.shard?.send(payload),
      connection: {
        host: data.lava_host,
        password: data.lava_pass,
        port: 2333
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
    readonly music: Node;
  }
}
