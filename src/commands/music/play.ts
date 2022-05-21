import type { TrackInfo } from '@lavaclient/types';
import type { Song } from './../../lib/utils/queue/Song';
import { NowPlayingEmbed } from '../../lib/utils/music/NowPlayingEmbed';
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
import { embedButtons } from '../../lib/utils/music/ButtonHandler';
import * as optionsFile from '../../options.json';
import { shuffleQueue } from '../../lib/utils/music/handleOptions';

@ApplyOptions<CommandOptions>({
  name: 'play',
  description: 'Play any song or playlist from YouTube, Spotify and more!',
  preconditions: [
    'GuildOnly',
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
    const shufflePlaylist = interaction.options.getString('shuffle-playlist');

    const interactionMember = interaction.member as GuildMember;

    let player = client.music.players.get(interaction.guild!.id);
    if (player?.queue.tracks.length! >= optionsFile.maxQueueLength)
      return await interaction.followUp(
        `:x: Can't add anymore songs to the queue`
      );

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

    // Apply options
    let playerQueue: number = player?.queue.tracks.length ?? 0;
    let liveStreams: boolean = false;
    let queueLimit: boolean = false;
    let longerThan1Hour: boolean = false;
    tracks.forEach(value => {
      //@ts-ignore
      const trackInfo = value['info'] as TrackInfo;
      if (
        tracks.length >= optionsFile.maxQueueLength ||
        playerQueue + tracks.length >= optionsFile.maxQueueLength
      ) {
        if (playerQueue > optionsFile.maxQueueLength) {
          tracks.pop();
          queueLimit = true;
        }
        playerQueue++;
      }
      if (optionsFile.playLiveStreams == false) {
        if (trackInfo.isStream) {
          tracks.pop();
          liveStreams = true;
        }
      }
      if (optionsFile.playVideosLongerThan1Hour == false) {
        if (trackInfo.length > 3600) {
          longerThan1Hour = true;
          tracks.pop();
        }
      }
    });
    // inform user about changes to the expected queue
    if (liveStreams)
      await interaction.followUp(
        ':x: Live Streams have been disabled, and were removed'
      );
    if (queueLimit)
      message = `:x: Queue Limit reached, Could only add ${tracks.length} songs to the queue`;

    if (longerThan1Hour)
      await interaction.followUp(':x: Tracks longer than 1 hour were removed');
    // No more songs after option were applied
    if (tracks.length == 0) return console.log('this is bad news bears');

    if (shufflePlaylist == 'Yes') shuffleQueue(tracks as Song[]);

    if (!player?.connected) {
      const channelDB = await prisma.guild.findFirst({
        where: {
          id: interaction.guild!.id
        },
        select: {
          volume: true
        }
      });

      player ??= client.music.createPlayer(interaction.guild!.id);
      player.queue.channel = interaction.channel as MessageChannel;
      if (channelDB?.volume) {
        await player.setVolume(channelDB.volume);
      }
      await player.connect(voiceChannel!.id, { deafened: true });
    }

    const started = player.playing || player.paused;

    await interaction
      .followUp(message)
      .then(followUp => (followUp.embeds = []));
    player.queue.add(tracks, {
      requester: interaction.user.id,
      userInfo: interactionMember,
      added: Date.now()
    });
    if (!started) {
      await player.queue.start();
    } else {
      const NowPlaying = new NowPlayingEmbed(
        player.queue.current!,
        player.accuratePosition,
        player.queue.current?.length as number,
        player.volume,
        player.queue.tracks!,
        player.queue.last!,
        player.paused
      );

      await embedButtons(
        NowPlaying.NowPlayingEmbed(),
        player.queue,
        player.queue.current!
      );
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
