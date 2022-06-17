import type { ClientTwitchExtension } from '../lib/utils/twitch/twitchAPI-types';
import { TwitchAPI } from '../lib/utils/twitch/twitchAPI';
import { SapphireClient } from '@sapphire/framework';
import { Intents } from 'discord.js';
import { QueueClient } from '../lib/utils/queue/QueueClient';
import * as data from '../config.json';
import Redis from 'ioredis';

export class ExtendedClient extends SapphireClient {
  readonly music: QueueClient;
  leaveTimers: { [key: string]: NodeJS.Timer };
  twitch: ClientTwitchExtension = {
    api: new TwitchAPI(data.twitchClientID, data.twitchClientSecret),
    auth: {
      access_token: '',
      refresh_token: '',
      expires_in: 0,
      token_type: '',
      scope: ['']
    },
    notifyList: {}
  };

  public constructor() {
    super({
      intents: [
        Intents.FLAGS.GUILDS,
        Intents.FLAGS.GUILD_MEMBERS,
        Intents.FLAGS.GUILD_MESSAGES,
        Intents.FLAGS.GUILD_VOICE_STATES,
        Intents.FLAGS.DIRECT_MESSAGES,
        Intents.FLAGS.DIRECT_MESSAGE_REACTIONS
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
    this.ws.on('VOICE_SERVER_UPDATE', async data => {
      // handle if a mod right-clicks disconnect on the bot
      if (!data.channel_id && data.user_id === this.application?.id) {
        const queue = this.music.queues.get(data.guild_id!);
        await queue.leave();
      }
      this.music.handleVoiceUpdate(data);
    });
    this.ws.on('VOICE_STATE_UPDATE', data => {
      this.music.handleVoiceUpdate(data);
    });

    if (data.twitchClientID && data.twitchClientSecret) {
      this.twitch.api?.getAccessToken('user:read:email').then(response => {
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
          ?.getAccessToken('user:read:email')
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
    } else {
      console.log('Twitch-Features are Disabled');
    }

    this.leaveTimers = {};
  }
}

declare module '@sapphire/framework' {
  interface SapphireClient {
    readonly music: QueueClient;
    leaveTimers: { [key: string]: NodeJS.Timer };
    twitch: ClientTwitchExtension;
  }
}
