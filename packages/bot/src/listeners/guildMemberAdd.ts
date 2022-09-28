//import type { Guild } from '@prisma/client';
import { ApplyOptions } from '@sapphire/decorators';
import { Listener, ListenerOptions } from '@sapphire/framework';
import type { GuildMember, TextChannel } from 'discord.js';
import { trpcNode } from '../trpc';

@ApplyOptions<ListenerOptions>({
  name: 'guildMemberAdd'
})
export class GuildMemberListener extends Listener {
  public override async run(member: GuildMember): Promise<void> {
    const guildQuery = await trpcNode.guild.getGuild.query({
      id: member.guild.id
    });

    if (!guildQuery || !guildQuery.guild) return;

    const { welcomeMessage, welcomeMessageEnabled, welcomeMessageChannel } =
      guildQuery.guild;

    if (
      !welcomeMessageEnabled ||
      !welcomeMessage ||
      !welcomeMessage.length ||
      !welcomeMessageChannel
    ) {
      return;
    }

    const channel = (await member.guild.channels.fetch(
      welcomeMessageChannel
    )) as TextChannel;

    if (channel) {
      await channel.send({ content: `@${member.id} ${welcomeMessage}` });
    }
  }
}
