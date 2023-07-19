import { ApplyOptions } from "@sapphire/decorators";
import { isTextBasedChannel } from "@sapphire/discord.js-utilities";
import { Command, CommandOptions, container } from "@sapphire/framework";
import type { GuildChannel } from "discord.js";

import { trpcNode } from "../../trpc";

@ApplyOptions<CommandOptions>({
  name: "remove-streamer",
  description: "Add a Stream alert from your favorite Twitch streamer",
  requiredUserPermissions: "ModerateMembers",
  preconditions: ["GuildOnly", "isCommandDisabled"],
})
export class RemoveStreamerCommand extends Command {
  public override async chatInputRun(
    interaction: Command.ChatInputCommandInteraction,
  ) {
    const streamerName = interaction.options.getString("streamer-name", true);
    const channelData = interaction.options.getChannel("channel-name", true);
    const { client } = container;

    let user: any;
    try {
      user = await client.twitch.api.getUser({
        login: streamerName,
        token: client.twitch.auth.access_token,
      });
    } catch (error: any) {
      if (error.status == 400) {
        return await interaction.reply({
          content: `:x: "${streamerName}" was Invalid, Please try again.`,
        });
      }
      if (error.status == 429) {
        return await interaction.reply({
          content:
            ":x: Rate Limit exceeded. Please try again in a few minutes.",
        });
      }
      if (error.status == 500) {
        return await interaction.reply({
          content: `:x: Twitch service's are currently unavailable. Please try again later.`,
        });
      } else {
        return await interaction.reply({
          content: `:x: Something went wrong.`,
        });
      }
    }

    if (!user)
      return await interaction.reply({
        content: `:x: ${streamerName} was not Found`,
      });
    if (!isTextBasedChannel(channelData as GuildChannel))
      return await interaction.reply({
        content: `:x: Cant sent messages to ${channelData.name}`,
      });

    const guildDB = await trpcNode.guild.getGuild.query({
      id: interaction.guild!.id,
    });

    const notifyDB = await trpcNode.twitch.findUserById.query({
      id: user.id,
    });

    if (!guildDB.guild || !guildDB.guild.notifyList.includes(user.id))
      return await interaction.reply({
        content: `:x: **${user.display_name}** is not in your Notification list`,
      });

    if (!notifyDB || !notifyDB.notification)
      return await interaction.reply({
        content: `:x: **${user.display_name}** was not found in Database`,
      });

    let found = false;
    notifyDB.notification.channelIds.forEach((channel) => {
      if (channel == channelData.id) found = true;
    });
    if (found === false)
      return await interaction.reply({
        content: `:x: **${user.display_name}** is not assigned to **${channelData}**`,
      });

    const filteredTwitchIds: string[] = guildDB.guild.notifyList.filter(
      (element) => {
        return element !== user.id;
      },
    );

    await trpcNode.guild.updateTwitchNotifications.mutate({
      guildId: interaction.guild!.id,
      notifyList: filteredTwitchIds,
    });

    const filteredChannelIds: string[] =
      notifyDB.notification.channelIds.filter((element) => {
        return element !== channelData.id;
      });

    if (filteredChannelIds.length == 0) {
      await trpcNode.twitch.delete.mutate({
        userId: user.id,
      });
      delete client.twitch.notifyList[user.id];
    } else {
      await trpcNode.twitch.updateNotification.mutate({
        userId: user.id,
        channelIds: filteredChannelIds,
      });

      client.twitch.notifyList[user.id]!.sendTo = filteredChannelIds;
    }

    await interaction.reply({
      content: `**${user.display_name}** Stream Notification will no longer be sent to **#${channelData.name}**`,
    });

    return;
  }

  public override registerApplicationCommands(
    registry: Command.Registry,
  ): void {
    if (!process.env.TWITCH_CLIENT_ID || !process.env.TWITCH_CLIENT_SECRET) {
      return;
    }

    registry.registerChatInputCommand((builder) =>
      builder
        .setName(this.name)
        .setDescription(this.description)
        .addStringOption((option) =>
          option
            .setName("streamer-name")
            .setDescription("What is the name of the Twitch streamer?")
            .setRequired(true),
        )
        .addChannelOption((option) =>
          option
            .setName("channel-name")
            .setDescription(
              "What is the name of the Channel you would like the Alert to be removed from?",
            )
            .setRequired(true),
        ),
    );
  }
}
