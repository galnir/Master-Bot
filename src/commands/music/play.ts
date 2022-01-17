import { ApplyOptions } from '@sapphire/decorators';
import {
  ApplicationCommandRegistry,
  Command,
  CommandOptions
} from '@sapphire/framework';
import type {
  CommandInteraction,
  GuildMember,
  VoiceBasedChannel
} from 'discord.js';
import { SpotifyItemType } from '@lavaclient/spotify';
import { container } from '@sapphire/framework';
import type { Addable } from '@lavaclient/queue';

@ApplyOptions<CommandOptions>({
  name: 'play',
  description: 'Play any song or playlist from YouTube and Spotify!',
  preconditions: ['inVoiceChannel', 'inPlayerVoiceChannel']
})
export class PlayCommand extends Command {
  public override async chatInputRun(interaction: CommandInteraction) {
    await interaction.deferReply();

    const { client } = container;
    const guildId = interaction.guildId as string;

    let query = interaction.options.getString('query', true);

    const member = interaction.member as GuildMember;

    const voiceChannel = member.voice.channel as VoiceBasedChannel;

    let tracks: Addable[] = [];
    let player = container.client.music.players.get(guildId);
    let displayMessage = '';
    if (client.music.spotify.isSpotifyUrl(query)) {
      const item = await client.music.spotify.load(query);
      if (!item) {
        return await interaction.followUp(
          'Something went wrong! Please try again later'
        );
      }
      switch (item.type) {
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
          return await interaction.followUp({
            content: `Couldn't find what you were looking for :(`,
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
          return await interaction.followUp({
            content: `Couldn't find what you were looking for :(`,
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

    if (!player?.connected) {
      player ??= container.client.music.createPlayer(guildId);
      // @ts-ignore
      player.queue.channel = interaction.channel;
      await player.connect(voiceChannel.id, { deafened: true });
    }

    const started = player.playing || player.paused;

    player.queue.add(tracks, {
      requester: interaction.user.id
    });

    if (!started) {
      await player.setVolume(50);
      await player.queue.start();
    }

    return await interaction.followUp(displayMessage);
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
          required: true,
          type: 'STRING'
        }
      ]
    });
  }
}
