import { NowPlayingEmbed } from './../lib/utils/music/NowPlayingEmbed';
import { SapphireClient } from '@sapphire/framework';
import { Intents } from 'discord.js';
import { Node } from 'lavaclient';
import * as data from '../config.json';

export class ExtendedClient extends SapphireClient {
  readonly music: Node;
  timeOut: any = {}; // @@TODO find a better way

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

    this.music.on('queueFinish', queue => {
      queue.player.stop();

      this.timeOut[queue.player.guildId] = setTimeout(() => {
        queue.channel!.send(':zzz: Leaving due to inactivity');
        queue.player.disconnect();
        queue.player.node.destroyPlayer(queue.player.guildId);
      }, 30 * 1000);
    });

    this.music.on('trackStart', async (queue, song) => {
      if (this.timeOut[queue.player.guildId]) {
        clearTimeout(this.timeOut[queue.player.guildId]);
        this.timeOut[queue.player.guildId] = null;
      }
      const NowPlaying = new NowPlayingEmbed(
        song,
        undefined,
        queue.current!.length as number,
        queue.player.volume,
        queue.tracks!
      );
      return await queue.channel!.send({
        embeds: [NowPlaying.NowPlayingEmbed()]
      });
    });
  }
}

declare module '@sapphire/framework' {
  interface SapphireClient {
    readonly music: Node;
  }
}
