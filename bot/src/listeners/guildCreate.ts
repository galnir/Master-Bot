import { ApplyOptions } from '@sapphire/decorators';
import { Listener, ListenerOptions } from '@sapphire/framework';
import axios from 'axios';
import type { Guild } from 'discord.js';

@ApplyOptions<ListenerOptions>({
  name: 'guildCreate'
})
export class GuildCreateListener extends Listener {
  public override async run(guild: Guild): Promise<void> {
    await axios.post('http://localhost:1212/guild', null, {
      params: {
        id: guild.id,
        ownerId: guild.ownerId,
        name: guild.name
      }
    });
  }
}
