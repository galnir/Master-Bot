import { SapphireClient } from '@sapphire/framework';
import { IntentsBitField } from 'discord.js';
import '@sapphire/plugin-hmr/register';

export class ExtendedClient extends SapphireClient {
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
  }
}
