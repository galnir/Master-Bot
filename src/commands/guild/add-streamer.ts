import type { MessageChannel } from './../../index';
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
import { notify } from '../../lib/utils/twitch/notifyChannel';

@ApplyOptions<CommandOptions>({
  name: 'add-streamer',
  description: 'Add a Stream alert from your favorite Twitch streamer',
  requiredClientPermissions: 'MODERATE_MEMBERS'
})
export class AddStreamerCommand extends Command {
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
    if (guildDB?.notifyList.includes(user.id))
      return interaction.reply({
        content: `:x: ${user.display_name} is already on your Notification list`
      });

    for (let twitchChannel in client.twitch.notifyList) {
      for (const channelToMsg of client.twitch.notifyList[twitchChannel]
        .sendTo) {
        const query = client.channels.cache.get(channelToMsg) as MessageChannel;
        if (query)
          if (query.guild.id == interaction.guild?.id) {
            if (twitchChannel == user.id)
              return interaction.reply({
                content: `:x: **${user.display_name}** is already has a notification in **#${query.name}**`
              });
          }
      }
    }
    if (client.twitch.notifyList[user.id]?.sendTo.includes(channelData.id))
      return interaction.reply({
        content: `:x: **${user.display_name}** is already messaging ${channelData.name}`
      });

    let channelArray;
    if (client.twitch.notifyList[user.id])
      channelArray = [
        ...client.twitch.notifyList[user.id].sendTo,
        ...[channelData.id]
      ];
    else channelArray = [channelData.id];

    client.twitch.notifyList[user.id]
      ? (client.twitch.notifyList[user.id].sendTo = channelArray)
      : (client.twitch.notifyList[user.id] = {
          sendTo: [channelData.id],
          live: false,
          logo: user.profile_image_url,
          messageSent: false,
          messageHandler: {}
        });
    await prisma.twitchNotify.upsert({
      create: {
        twitchId: user.id,
        channelIds: [channelData.id],
        logo: user.profile_image_url,
        sent: false
      },
      update: { channelIds: client.twitch.notifyList[user.id].sendTo },
      where: { twitchId: user.id }
    });

    await prisma.guildTwitch.upsert({
      create: {
        id: interaction.guild?.id as string,
        notifyList: [user.id]
      },
      select: { notifyList: true },
      update: {
        notifyList: guildDB?.notifyList.concat([user.id])
      },
      where: { id: interaction.guild?.id }
    });
    await interaction.reply({
      content: `**${user.display_name}** Stream Notification will be sent to **#${channelData.name}**`
    });
    const newQuery: string[] = [];
    // pickup newly added entries
    for (const key in client.twitch.notifyList) {
      newQuery.push(key);
    }
    await notify(newQuery);
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
            'What is the name of the Channel you would like the Alert sent to?',
          type: 'CHANNEL',
          required: true
        }
      ]
    });
  }
}
