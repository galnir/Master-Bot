import { SapphireClient } from '@sapphire/framework';
import { Intents } from 'discord.js';
import * as data from './config.json';

const client = new SapphireClient({
  intents: [
    Intents.FLAGS.GUILDS,
    Intents.FLAGS.GUILD_MEMBERS,
    Intents.FLAGS.GUILD_MESSAGES,
    Intents.FLAGS.GUILD_VOICE_STATES
  ]
});

client.login(data.token);
