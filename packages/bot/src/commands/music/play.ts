import { ApplyOptions } from '@sapphire/decorators';
import {
  ApplicationCommandRegistry,
  Command,
  CommandOptions
} from '@sapphire/framework';
import type { CommandInteraction, GuildMember } from 'discord.js';
import { container } from '@sapphire/framework';
import searchSong from '../../lib/utils/music/searchSong';
import type { Song } from '../../lib/utils/queue/Song';
import { trpcNode } from '../../trpc';

@ApplyOptions<CommandOptions>({
  name: 'play',
  description: 'Play any song or playlist from YouTube, Spotify and more!',
  preconditions: [
    'GuildOnly',
    'isCommandDisabled',
    'inVoiceChannel',
    'inPlayerVoiceChannel'
  ]
})
export class PlayCommand extends Command {
  public override async chatInputRun(interaction: CommandInteraction) {
    await interaction.deferReply();

    const { client } = container;

    const query = interaction.options.getString('query', true);
    const isCustomPlaylist =
      interaction.options.getString('is-custom-playlist');
    const shufflePlaylist = interaction.options.getString('shuffle-playlist');

    const interactionMember = interaction.member as GuildMember;
    const { music } = client;

    // had a precondition make sure the user is infact in a voice channel
    const voiceChannel = interaction.guild?.voiceStates?.cache?.get(
      interaction.user.id
    )?.channel!;

    let queue = music.queues.get(interaction.guildId!);
    await queue.setTextChannelID(interaction.channel!.id);

    if (!queue.player) {
      const player = queue.createPlayer();
      await player.connect(voiceChannel.id, { deafened: true });
    }

    let tracks: Song[] = [];
    let message: string = '';

    if (isCustomPlaylist == 'Yes') {
      // const playlist = await prisma.playlist.findFirst({
      //   where: {
      //     userId: interactionMember.id,
      //     name: query
      //   },
      //   select: {
      //     songs: true
      //   }
      // });
      const data = await trpcNode.query('playlist.get-playlist', {
        userId: interactionMember.id,
        name: query
      });

      const { playlist } = data;

      if (!playlist) {
        return await interaction.followUp(`:x: You have no such playlist!`);
      }
      if (!playlist.songs.length) {
        return await interaction.followUp(`:x: **${query}** is empty!`);
      }

      const { songs } = playlist;
      tracks.push(...songs);
      message = `Added songs from **${playlist}** to the queue!`;
    } else {
      const trackTuple = await searchSong(query, interaction.user);
      if (!trackTuple[1].length) {
        return await interaction.followUp({ content: trackTuple[0] as string }); // error
      }
      message = trackTuple[0];
      tracks.push(...trackTuple[1]);
    }

    await queue.add(tracks);
    if (shufflePlaylist == 'Yes') {
      await queue.shuffleTracks();
    }

    const current = await queue.getCurrentTrack();
    if (!current) {
      await queue.start();
    } else {
      client.emit(
        'musicSongPlayMessage',
        interaction.channel,
        await queue.getCurrentTrack()
      );
    }

    const track = await queue.getCurrentTrack();
    if (!track) return;
    return await interaction.followUp({ content: message });
  }

  public override registerApplicationCommands(
    registry: ApplicationCommandRegistry
  ): void {
    registry.registerChatInputCommand({
      name: this.name,
      description: this.description,
      options: [
        {
          name: 'query',
          description: 'What song or playlist would you like to listen to?',
          type: 'STRING',
          required: true
        },
        {
          name: 'is-custom-playlist',
          description: 'Is it a custom playlist?',
          type: 'STRING',
          choices: [
            {
              name: 'Yes',
              value: 'Yes'
            },
            {
              name: 'No',
              value: 'No'
            }
          ]
        },
        {
          name: 'shuffle-playlist',
          description: 'Would you like to shuffle the playlist?',
          type: 'STRING',
          choices: [
            {
              name: 'Yes',
              value: 'Yes'
            },
            {
              name: 'No',
              value: 'No'
            }
          ]
        }
      ]
    });
  }
}
