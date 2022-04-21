import type { ClientTwitchExtension } from './../lib/utils/twitch/twitchAPI-types';
import { SapphireClient } from '@sapphire/framework';
import { Intents } from 'discord.js';
import { Node } from 'lavaclient';
import * as data from '../config.json';
import { TwitchClient } from '../lib/utils/twitch/twitchAPI';

export class ExtendedClient extends SapphireClient {
  readonly music: Node;
  twitch: ClientTwitchExtension = {
    api: new TwitchClient(data.twitchClientID, data.twitchClientSecret),
    auth: {
      access_token: '',
      refresh_token: '',
      expires_in: 0,
      token_type: '',
      scope: ['']
    }
  };

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
    if (data.twitchClientID && data.twitchClientSecret) {
      this.twitch.api.getAccessToken('user:read:email').then(response => {
        this.twitch.auth = {
          access_token: response.access_token,
          refresh_token: response.refresh_token,
          expires_in: response.expires_in,
          token_type: response.token_type,
          scope: response.scope
        };
      });

      setInterval(() => {
        this.twitch.api
          .getAccessToken('user:read:email')
          .then(response => {
            this.twitch.auth = {
              access_token: response.access_token,
              refresh_token: response.refresh_token,
              expires_in: response.expires_in,
              token_type: response.token_type,
              scope: response.scope
            };
          })
          .catch(error => {
            console.log(error);
          });
      }, 4.32e7); // refresh every 12 hours
    }

    this.ws.on('VOICE_SERVER_UPDATE', data => {
      this.music.handleVoiceUpdate(data);
    });
    this.ws.on('VOICE_STATE_UPDATE', data => {
      this.music.handleVoiceUpdate(data);
    });

    this.music.on('queueFinish', queue => {
      queue.channel!.send("There are no more songs in queue, I'm out");
      queue.player.disconnect();
      queue.player.node.destroyPlayer(queue.player.guildId);
    });

    this.music.on('trackStart', (queue, song) => {
      queue.channel!.send(`Now playing **${song.title}**`);
    });
  }
}

declare module '@sapphire/framework' {
  interface SapphireClient {
    readonly music: Node;
    twitch: ClientTwitchExtension;
  }
}
