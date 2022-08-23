import type { MessageChannel } from '../../index';
import { ApplyOptions } from '@sapphire/decorators';
import {
  ApplicationCommandRegistry,
  Command,
  CommandOptions,
  container
} from '@sapphire/framework';
import type { CommandInteraction, GuildChannel } from 'discord.js';
import { isTextBasedChannel } from '@sapphire/discord.js-utilities';
import { notify } from '../../lib/utils/twitch/notifyChannel';
import { trpcNode } from '../../trpc';

@ApplyOptions<CommandOptions>({
  name: 'add-streamer',
  description: 'Add a Stream alert from your favorite Twitch streamer',
  requiredUserPermissions: 'MODERATE_MEMBERS',
  preconditions: ['GuildOnly', 'isCommandDisabled']
})
export class AddStreamerCommand extends Command {
  public override async chatInputRun(interaction: CommandInteraction) {
    const streamerName = interaction.options.getString('streamer-name', true);
    const channelData = interaction.options.getChannel('channel-name', true);
    const { client } = container;

    let isError = false;

    const user = await client.twitch.api
      .getUser({
        login: streamerName,
        token: client.twitch.auth.access_token
      })
      .catch(async error => {
        isError = true;
        if (error.status == 400) {
          return await interaction.reply({
            content: `:x: "${streamerName}" was Invalid, Please try again.`
          });
        }
        if (error.status === 401) {
          return await interaction.reply({
            content: `:x: You are not authorized to use this command.`
          });
        }
        if (error.status == 429) {
          return await interaction.reply({
            content:
              ':x: Rate Limit exceeded. Please try again in a few minutes.'
          });
        }
        if (error.status == 500) {
          return await interaction.reply({
            content: `:x: Twitch service's are currently unavailable. Please try again later.`
          });
        } else {
          return await interaction.reply({
            content: `:x: Something went wrong.`
          });
        }
      });
    if (isError) return;
    if (!user)
      return await interaction.reply({
        content: `:x: ${streamerName} was not Found`
      });
    if (!isTextBasedChannel(channelData as GuildChannel))
      return await interaction.reply({
        content: `:x: Can't send messages to ${channelData.name}`
      });

    const guildDB = await trpcNode.query('guild.get-guild', {
      id: interaction.guild!.id
    });

    if (!guildDB.guild) {
      return await interaction.reply({
        content: `:x: Something went wrong.`
      });
    }

    // check if streamer is already on notify list
    if (guildDB?.guild.notifyList.includes(user.id))
      return await interaction.reply({
        content: `:x: ${user.display_name} is already on your Notification list`
      });

    // make sure channel is not already on notify list
    for (const twitchChannel in client.twitch.notifyList) {
      for (const channelToMsg of client.twitch.notifyList[twitchChannel]
        .sendTo) {
        const query = client.channels.cache.get(channelToMsg) as MessageChannel;
        if (query)
          if (query.guild.id == interaction.guild?.id) {
            if (twitchChannel == user.id)
              return await interaction.reply({
                content: `:x: **${user.display_name}** is already has a notification in **#${query.name}**`
              });
          }
      }
    }
    // make sure no one else is already sending alerts about this streamer
    if (client.twitch.notifyList[user.id]?.sendTo.includes(channelData.id))
      return await interaction.reply({
        content: `:x: **${user.display_name}** is already messaging ${channelData.name}`
      });

    let channelArray;
    if (client.twitch.notifyList[user.id])
      channelArray = [
        ...client.twitch.notifyList[user.id].sendTo,
        ...[channelData.id]
      ];
    else channelArray = [channelData.id];

    // add notification to twitch object on client
    client.twitch.notifyList[user.id]
      ? (client.twitch.notifyList[user.id].sendTo = channelArray)
      : (client.twitch.notifyList[user.id] = {
          sendTo: [channelData.id],
          live: false,
          logo: user.profile_image_url,
          messageSent: false,
          messageHandler: {}
        });

    // add notification to database
    await trpcNode.mutation('twitch.create', {
      userId: user.id,
      userImage: user.profile_image_url,
      channelId: channelData.id,
      sendTo: client.twitch.notifyList[user.id].sendTo
    });

    // add notification to guild on database
    const concatedArray = guildDB.guild.notifyList.concat([user.id]);

    const guild = interaction.guild!;
    await trpcNode.mutation('guild.create-via-twitch-notification', {
      name: guild.name,
      guildId: guild.id,
      notifyList: concatedArray,
      ownerId: guild.ownerId,
      userId: interaction.user.id
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
    registry: ApplicationCommandRegistry
  ): void {
    if (!process.env.TWITCH_CLIENT_ID || !process.env.TWITCH_CLIENT_SECRET) {
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
            'What is the name of the Channel you would like the Alert sent to?',
          type: 'CHANNEL',
          required: true
        }
      ]
    });
  }
}
