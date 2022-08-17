import type { Guild } from '@prisma/client';
import { ApplyOptions } from '@sapphire/decorators';
import { Listener, ListenerOptions } from '@sapphire/framework';
import axios from 'axios';
import type { GuildMember, TextChannel } from 'discord.js';

@ApplyOptions<ListenerOptions>({
  name: 'guildMemberAdd'
})
export class GuildMemberListener extends Listener {
  public override async run(member: GuildMember): Promise<void> {
    const response = await axios.get('http://localhost:1212/guild', {
      params: {
        id: member.guild.id
      }
    });
    const data = response.data as Guild;
    const { welcomeMessage, welcomeMessageEnabled, welcomeMessageChannel } =
      data;

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
