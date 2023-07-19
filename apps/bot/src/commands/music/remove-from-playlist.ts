import { ApplyOptions } from "@sapphire/decorators";
import { Command, CommandOptions } from "@sapphire/framework";

import { trpcNode } from "../../trpc";

@ApplyOptions<CommandOptions>({
  name: "remove-from-playlist",
  description: "Remove a song from a saved playlist",
  preconditions: [
    "GuildOnly",
    "isCommandDisabled",
    "userInDB",
    "playlistExists",
  ],
})
export class RemoveFromPlaylistCommand extends Command {
  public override async chatInputRun(
    interaction: Command.ChatInputCommandInteraction,
  ) {
    await interaction.deferReply();
    const playlistName = interaction.options.getString("playlist-name", true);
    const location = interaction.options.getInteger("location", true);

    const interactionMember = interaction.member?.user;

    if (!interactionMember) {
      return await interaction.followUp(
        ":x: Something went wrong! Please try again later",
      );
    }

    let playlist;
    try {
      const playlistQuery = await trpcNode.playlist.getPlaylist.query({
        name: playlistName,
        userId: interactionMember.id,
      });

      playlist = playlistQuery.playlist;
    } catch (error) {
      return await interaction.followUp(":x: Something went wrong!");
    }

    const songs = playlist?.songs;

    if (!songs?.length) {
      return await interaction.followUp(`:x: **${playlistName}** is empty!`);
    }

    if (location > songs.length || location < 0) {
      return await interaction.followUp(":x: Please enter a valid index!");
    }

    const id = songs[location - 1]!.id;

    const song = await trpcNode.song.delete.mutate({
      id,
    });

    if (!song) {
      return await interaction.followUp(":x: Something went wrong!");
    }

    await interaction.followUp(
      `:wastebasket: Deleted **${song.song.title}** from **${playlistName}**`,
    );
    return;
  }

  public override registerApplicationCommands(
    registry: Command.Registry,
  ): void {
    registry.registerChatInputCommand((builder) =>
      builder
        .setName(this.name)
        .setDescription(this.description)
        .addStringOption((option) =>
          option
            .setName("playlist-name")
            .setDescription(
              "What is the name of the playlist you want to remove from?",
            )
            .setRequired(true),
        )
        .addIntegerOption((option) =>
          option
            .setName("location")
            .setDescription(
              "What is the index of the video you would like to delete from your saved playlist?",
            )
            .setRequired(true),
        ),
    );
  }
}
