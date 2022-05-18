import { SapphireClient } from '@sapphire/framework';
import { Intents, User } from 'discord.js';
import { Node } from 'lavaclient';
import * as data from '../config.json';
import { embedButtons } from '../lib/utils/music/ButtonHandler';
import { NowPlayingEmbed } from './../lib/utils/music/NowPlayingEmbed';
import { manageStageChannel } from './../lib/utils/music/channelHandler';

export class ExtendedClient extends SapphireClient {
  readonly music: Node;
  gameData: {
    connect4Players: Map<string, User>;
    tictactoePlayers: Map<string, User>;
  };
  leaveTimers: { [key: string]: NodeJS.Timer };

  public constructor() {
    super({
      intents: [
        Intents.FLAGS.GUILDS,
        Intents.FLAGS.GUILD_MEMBERS,
        Intents.FLAGS.GUILD_MESSAGES,
        Intents.FLAGS.GUILD_VOICE_STATES,
        Intents.FLAGS.GUILD_MESSAGE_REACTIONS
      ]
    });

    this.gameData = {
      connect4Players: new Map(),
      tictactoePlayers: new Map()
    };

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

    this.leaveTimers = {};
    this.music.on('queueFinish', queue => {
      queue.player.stop();

      this.leaveTimers[queue.player.guildId] = setTimeout(() => {
        queue.channel!.send(':zzz: Leaving due to inactivity');
        queue.player.disconnect();
        queue.player.node.destroyPlayer(queue.player.guildId);
      }, 30 * 1000);
    });

    this.music.on('trackStart', async (queue, song) => {
      if (this.leaveTimers[queue.player.guildId]) {
        clearTimeout(this.leaveTimers[queue.player.guildId]!);
      }

      const NowPlaying = new NowPlayingEmbed(
        song,
        0,
        queue.current!.length as number,
        queue.player.volume,
        queue.tracks!,
        queue.last!,
        false
      );

      await embedButtons(NowPlaying.NowPlayingEmbed(), queue, song);

      const voiceChannel = this.voice.client.channels.cache.get(
        queue.player.channelId!
      );
      // Stage Channels
      if (voiceChannel?.type === 'GUILD_STAGE_VOICE') {
        const botUser = voiceChannel?.members.get(this.application?.id!);
        await manageStageChannel(voiceChannel, botUser!, queue);
      }
    });
  }
}

declare module '@sapphire/framework' {
  interface SapphireClient {
    readonly music: Node;
    gameData: {
      connect4Players: Map<string, User>;
      tictactoePlayers: Map<string, User>;
    };
    leaveTimers: { [key: string]: NodeJS.Timer };
  }
}
