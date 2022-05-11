// import type { MessageChannel } from './../../index';
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
// import prisma from '../../lib/prisma';
// import { notify } from '../../lib/utils/twitch/notifyChannel';

@ApplyOptions<CommandOptions>({
  name: 'remove-streamer',
  description: 'Add a Stream alert from your favorite Twitch streamer',
  requiredClientPermissions: 'MODERATE_MEMBERS'
})
export class RemoveStreamerCommand extends Command {
  public override async chatInputRun(interaction: CommandInteraction) {
    const streamerName = interaction.options.getString('streamer-name', true);
    const channelData = interaction.options.getChannel('channel-name', true);
    const { client } = container;
    const user = await client.twitch.api.getUser({
      login: streamerName,
      token: client.twitch.auth.access_token
    });
    if (!user)
      return interaction.reply({
        content: `:x: ${streamerName} was not Found`
      });
    if (!isTextBasedChannel(channelData as GuildChannel))
      return interaction.reply({
        content: `:x: Cant sent messages to ${channelData.name}`
      });

    const guildDB = await prisma.guildTwitch.findFirst({
      where: { id: interaction.guild?.id },
      select: { notifyList: true }
    });
    const notifyDB = await prisma.twitchNotify.findFirst({
      where: { twitchId: user.id },
      select: { channelIds: true }
    });
    if (!guildDB?.notifyList.includes(user.id))
      return interaction.reply({
        content: `:x: ${user.display_name} is not in your Notification list`
      });
    if (!notifyDB)
      return interaction.reply({
        content: `:x: ${user.display_name} was not found in Database`
      });

    const filteredTwitchIds: string[] = guildDB.notifyList.filter(element => {
      return element !== user.id;
    });
    if (filteredTwitchIds.length == 0)
      await prisma.guildTwitch.delete({ where: { id: interaction.guild?.id } });
    else
      await prisma.guildTwitch.update({
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
    registery: ApplicationCommandRegistry
  ): void {
    registery.registerChatInputCommand({
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
