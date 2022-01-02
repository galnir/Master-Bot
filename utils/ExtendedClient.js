const { Client, Intents } = require('discord.js');
const { Node } = require('lavaclient');
const { lava_host, lava_pass } = require('../config.json');

class ExtendedClient extends Client {
  constructor() {
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
        this.guilds.cache.get(id).shard.send(payload),
      connection: {
        host: lava_host,
        password: lava_pass,
        port: 2333
      }
    });

    this.queueHistory = new Map();

    this.triviaMap = new Map();

    this.ws.on('VOICE_SERVER_UPDATE', data =>
      this.music.handleVoiceUpdate(data)
    );
    this.ws.on('VOICE_STATE_UPDATE', data =>
      this.music.handleVoiceUpdate(data)
    );
  }
}

module.exports = ExtendedClient;
