import { container } from '@sapphire/framework';
import type { Addable } from '../queue/Queue';
import { SpotifyItemType } from '@lavaclient/spotify';

export default async function searchSong(
  query: string
): Promise<[string, Addable[]]> {
  const { client } = container;
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
        displayMessage = ":x: Couldn't find what you were looking for :(";
        return [displayMessage, tracks];
    }
    return [displayMessage, tracks];
  } else {
    const results = await client.music.rest.loadTracks(
      /^https?:\/\//.test(query) ? query : `ytsearch:${query}`
    );

    switch (results.loadType) {
      case 'LOAD_FAILED':
      case 'NO_MATCHES':
        displayMessage = ":x: Couldn't find what you were looking for :(";
        return [displayMessage, tracks];
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

    return [displayMessage, tracks];
  }
}
