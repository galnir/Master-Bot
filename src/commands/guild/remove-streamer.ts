import { ApplyOptions } from '@sapphire/decorators';
import {
  ApplicationCommandRegistry,
  Command,
  CommandOptions,
  container
} from '@sapphire/framework';
import type { CommandInteraction, GuildChannel } from 'discord.js';
import { isTextBasedChannel } from '@sapphire/discord.js-utilities';
import prisma from '../../lib/prisma';
import data from '../../config.json';

@ApplyOptions<CommandOptions>({
  name: 'remove-streamer',
  description: 'Add a Stream alert from your favorite Twitch streamer',
  requiredUserPermissions: 'MODERATE_MEMBERS',
  preconditions: ['GuildOnly']
})
export class RemoveStreamerCommand extends Command {
  public override async chatInputRun(interaction: CommandInteraction) {
    const streamerName = interaction.options.getString('streamer-name', true);
    const channelData = interaction.options.getChannel('channel-name', true);
    const { client } = container;
    const user = await client.twitch.api
      .getUser({
        login: streamerName,
        token: client.twitch.auth.access_token
      })
      .catch(error => {
        if (error.status == 400) {
          return interaction.reply({
            content: `:x: "${streamerName}" was Invalid, Please try again.`
          });
        }
        if (error.status == 429) {
          return interaction.reply({
            content:
              ':x: Rate Limit exceeded. Please try again in a few minutes.'
          });
        }
        if (error.status == 500) {
          return interaction.reply({
            content: `:x: Twitch service's are currently unavailable. Please try again later.`
          });
        } else {
          return interaction.reply({
            content: `:x: Something went wrong.`
          });
        }
      });

    if (!user)
      return interaction.reply({
        content: `:x: ${streamerName} was not Found`
      });
    if (!isTextBasedChannel(channelData as GuildChannel))
      return interaction.reply({
        content: `:x: Cant sent messages to ${channelData.name}`
      });

    const guildDB = await prisma.guild.findFirst({
      where: { id: interaction.guild?.id },
      select: { notifyList: true }
    });
    const notifyDB = await prisma.twitchNotify.findFirst({
      where: { twitchId: user.id },
      select: { channelIds: true }
    });

    if (!guildDB?.notifyList.includes(user.id))
      return interaction.reply({
        content: `:x: **${user.display_name}** is not in your Notification list`
      });
    if (!notifyDB)
      return interaction.reply({
        content: `:x: **${user.display_name}** was not found in Database`
      });
    let found = false;
    notifyDB.channelIds.forEach(channel => {
      if (channel == channelData.id) found = true;
    });
    if (found === false)
      return interaction.reply({
        content: `:x: **${user.display_name}** is not assigned to **${channelData}**`
      });

    const filteredTwitchIds: string[] = guildDB.notifyList.filter(element => {
      return element !== user.id;
    });

    await prisma.guild.update({
      where: { id: interaction.guild?.id },
      data: { notifyList: filteredTwitchIds }
    });

    const filteredChannelIds: string[] = notifyDB.channelIds.filter(element => {
      return element !== channelData.id;
    });
    if (filteredChannelIds.length == 0) {
      await prisma.twitchNotify.delete({ where: { twitchId: user.id } });
      delete client.twitch.notifyList[user.id];
    } else {
      await prisma.twitchNotify.update({
        where: { twitchId: user.id },
        data: { channelIds: filteredChannelIds }
      });
      client.twitch.notifyList[user.id].sendTo = filteredChannelIds;
    }

    await interaction.reply({
      content: `**${user.display_name}** Stream Notification will no longer be sent to **#${channelData.name}**`
    });
  }

  public override registerApplicationCommands(
    registry: ApplicationCommandRegistry
  ): void {
    if (!data.twitchClientID || !data.twitchClientSecret) {
      return;
    }
    registry.registerChatInputCommand({
      name: this.name,
      description: this.description,

      options: [
        {
          name: 'streamer-name',
          description: 'What is the name of the Twitch streamer?',
          type: 'STRING',
          required: true
        },
        {
          name: 'channel-name',
          description:
            'What is the name of the Channel you would like the Alert to be removed from?',
          type: 'CHANNEL',
          required: true
        }
      ]
    });
  }
}
