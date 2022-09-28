import { ApplyOptions } from '@sapphire/decorators';
import { Listener, ListenerOptions } from '@sapphire/framework';
import type { Guild } from 'discord.js';
import { trpcNode } from '../trpc';

@ApplyOptions<ListenerOptions>({
  name: 'guildDelete'
})
export class GuildDeleteListener extends Listener {
  public override async run(guild: Guild): Promise<void> {
    await trpcNode.guild.delete.mutate({
      id: guild.id
    });
  }
}
