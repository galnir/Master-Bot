import type { MessageChannel } from './../../index';
import { ApplyOptions } from '@sapphire/decorators';
import {
  ApplicationCommandRegistry,
  Command,
  CommandOptions,
  container
} from '@sapphire/framework';
import { CommandInteraction, Guild, MessageEmbed } from 'discord.js';
import { PaginatedFieldMessageEmbed } from '@sapphire/discord.js-utilities';
import prisma from '../../lib/prisma';

@ApplyOptions<CommandOptions>({
  name: 'show-announcer-list',
  description: 'Display the Guilds Twitch notification list '
})
export class ShowAnnouncerListCommand extends Command {
  public override async chatInputRun(interaction: CommandInteraction) {
    const { client } = container;
    const interactionGuild = interaction.guild as Guild;

    const guildDB = await prisma.guildTwitch.findFirst({
      where: {
        id: interactionGuild.id
      },
      select: {
        notifyList: true
      }
    });

    if (!guildDB) {
      return await interaction.reply(':x: No streamers are in your list');
    }
    const icon = interactionGuild.iconURL({ dynamic: true });
    const baseEmbed = new MessageEmbed().setColor('#6441A5').setAuthor({
      name: `${interactionGuild.name} - Twitch Alerts`,
      iconURL: icon!
    });

    const users = await client.twitch.api.getUsers({
      ids: guildDB.notifyList,
      token: client.twitch.auth.access_token
    });

    const myList = [];
    for (const streamer of users) {
      for (const channel in client.twitch.notifyList[streamer.id].sendTo) {
        const guildChannel = client.channels.cache.get(
          client.twitch.notifyList[streamer.id].sendTo[channel]
        ) as MessageChannel;
        if (guildChannel)
          if (guildChannel.guild.id == interactionGuild.id)
            myList.push({
              name: streamer.display_name,
              channel: guildChannel.name
            });
      }
    }
    new PaginatedFieldMessageEmbed()
      .setTitleField('Streamers')
      .setTemplate(baseEmbed)
      .setItems(myList)
      .formatItems(
        (index: any) => `**${index.name}** Sending to **#${index.channel}**`
      )
      .setItemsPerPage(5)
      .make()
      .run(interaction);
  }

  public override registerApplicationCommands(
    registery: ApplicationCommandRegistry
  ): void {
    registery.registerChatInputCommand({
      name: this.name,
      description: this.description
    });
  }
}
