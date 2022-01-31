import { ApplyOptions } from '@sapphire/decorators';
import {
  ApplicationCommandRegistry,
  Command,
  CommandOptions
} from '@sapphire/framework';
import type { CommandInteraction } from 'discord.js';
import { container } from '@sapphire/framework';
import type { Addable } from '../../lib/queue/Queue';
import { SpotifyItemType } from '@lavaclient/spotify';
import type { MessageChannel } from '../..';

@ApplyOptions<CommandOptions>({
  name: 'play',
  description: 'Play any song or playlist from YouTube and Spotify!',
  preconditions: [
    'inVoiceChannel',
    'musicTriviaPlaying',
    'inPlayerVoiceChannel'
  ]
})
export class PlayCommand extends Command {
  public override async chatInputRun(interaction: CommandInteraction) {
    await interaction.deferReply();
    const { client } = container;
    const query = interaction.options.getString('query', true);

    // had a precondition make sure the user is infact in a voice channel
    const voiceChannel = interaction.guild?.voiceStates?.cache?.get(
      interaction.user.id
    )?.channel;

    let tracks: Addable[] = [];
    let displayMessage = '';

    if (client.music.spotify.isSpotifyUrl(query)) {
      const item = await client.music.spotify.load(query);
      switch (item?.type) {
        case SpotifyItemType.Track:
          const track = await item.resolveYoutubeTrack();
          tracks = [track];
          displayMessage = `Queued track [**${item.name}**](${query}).`;
          break;
        case SpotifyItemType.Artist:
          tracks = await item.resolveYoutubeTracks();
          displayMessage = `Queued the **Top ${tracks.length} tracks** for [**${item.name}**](${query}).`;
          break;
        case SpotifyItemType.Album:
        case SpotifyItemType.Playlist:
          tracks = await item.resolveYoutubeTracks();
          displayMessage = `Queued **${
            tracks.length
          } tracks** from ${SpotifyItemType[item.type].toLowerCase()} [**${
            item.name
          }**](${query}).`;
          break;
        default:
          return interaction.followUp({
            content: "Couldn't find what you were looking for :(",
            ephemeral: true
          });
      }
    } else {
      const results = await client.music.rest.loadTracks(
        /^https?:\/\//.test(query) ? query : `ytsearch:${query}`
      );

      switch (results.loadType) {
        case 'LOAD_FAILED':
        case 'NO_MATCHES':
          return interaction.followUp({
            content: "Couldn't find what you were looking for :(`",
            ephemeral: true
          });
        case 'PLAYLIST_LOADED':
          tracks = results.tracks;
          displayMessage = `Queued playlist [**${results.playlistInfo.name}**](${query}), it has a total of **${tracks.length}** tracks.`;
          break;
        case 'TRACK_LOADED':
        case 'SEARCH_RESULT':
          const [track] = results.tracks;
          tracks = [track];
          displayMessage = `Queued [**${track.info.title}**](${track.info.uri})`;
          break;
      }
    }

    let player = client.music.players.get(interaction.guild!.id);

    if (!player?.connected) {
      player ??= client.music.createPlayer(interaction.guild!.id);
      player.queue.channel = interaction.channel as MessageChannel;
      await player.connect(voiceChannel!.id, { deafened: true });
    }

    const started = player.playing || player.paused;

    await interaction.followUp(displayMessage);

    player.queue.add(tracks, { requester: interaction.user.id });
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
        }
      ]
    });
  }
}
