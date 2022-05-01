import { ApplyOptions } from '@sapphire/decorators';
import {
  ApplicationCommandRegistry,
  Command,
  CommandOptions
} from '@sapphire/framework';
import type { CommandInteraction, GuildMember } from 'discord.js';
import { container } from '@sapphire/framework';
import type { MessageChannel } from '../..';
import searchSong from '../../lib/utils/music/searchSong';
import type { Addable } from '../../lib/utils/queue/Queue';
import prisma from '../../lib/prisma';
//import Member from '../../lib/models/Member';

@ApplyOptions<CommandOptions>({
  name: 'play',
  description: 'Play any song or playlist from YouTube, Spotify and more!',
  preconditions: [
    'inVoiceChannel',
    'musicTriviaPlaying',
    'inPlayerVoiceChannel',
    'userInDB'
  ]
})
export class PlayCommand extends Command {
  public override async chatInputRun(interaction: CommandInteraction) {
    await interaction.deferReply();
    const { client } = container;
    const query = interaction.options.getString('query', true);
    const isCustomPlaylist =
      interaction.options.getString('is-custom-playlist');

    const interactionMember = interaction.member as GuildMember;

    // had a precondition make sure the user is infact in a voice channel
    const voiceChannel = interaction.guild?.voiceStates?.cache?.get(
      interaction.user.id
    )?.channel;

    let tracks: Addable[] = [];
    let message: string = '';

    if (isCustomPlaylist == 'Yes') {
      const playlist = await prisma.playlist.findFirst({
        where: {
          userId: interactionMember.id,
          name: query
        },
        select: {
          songs: true
        }
      });

      if (!playlist) {
        return await interaction.followUp(`:x: You have no such playlist!`);
      }
      if (!playlist.songs.length) {
        return await interaction.followUp(`:x: **${query}** is empty!`);
      }

      const songs = playlist.songs;

      for (let i = 0; i < songs.length; i++) {
        const track = await searchSong(songs[i].url);
        if (!track[1].length) continue;

        tracks.push(...track[1]);
      }

      message = `Added tracks from **${query}** to the queue!`;
    } else {
      const trackTuple = await searchSong(query);
      if (!trackTuple[1].length) {
        return await interaction.followUp({ content: trackTuple[0] as string }); // error
      }
      message = trackTuple[0];
      tracks.push(...trackTuple[1]);
    }

    let player = client.music.players.get(interaction.guild!.id);

    if (!player?.connected) {
      let channelDB: { [key: string]: number | undefined } | null | void = {
        volume: undefined
      };
      channelDB = await prisma.guild
        .findUnique({
          where: {
            id: interaction.guild!.id || interaction.guildId!
          },
          select: {
            volume: true
          }
        })
        .catch(async error => {
          console.log(error);
          await prisma.guild.upsert({
            where: { id: interaction.guild!.id || interaction.guildId! },
            update: { volume: 100 },
            create: {
              id: interaction.guild!.id || interaction.guildId!,
              volume: 100
            }
          });
        });

      player ??= client.music.createPlayer(interaction.guild!.id);
      player.queue.channel = interaction.channel as MessageChannel;
      channelDB?.volume ? player.setVolume(channelDB.volume as number) : null;
      await player.connect(voiceChannel!.id, { deafened: true });
    }

    const started = player.playing || player.paused;

    await interaction.followUp({ content: message });
    player.queue.add(tracks, {
      requester: interaction.user.id,
      userInfo: interactionMember,
      added: Date.now()
    });
    if (!started) {
      await player.queue.start();
    }

    return;
  }

  public override registerApplicationCommands(
    registery: ApplicationCommandRegistry
  ): void {
    registery.registerChatInputCommand({
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
        }
      ]
    });
  }
}
