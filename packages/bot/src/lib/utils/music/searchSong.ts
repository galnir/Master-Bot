import { container } from '@sapphire/framework';
import { SpotifyItemType } from '@lavaclient/spotify';
import { Song } from '../queue/Song';
import type { User } from 'discord.js';

export default async function searchSong(
  query: string,
  user: User
): Promise<[string, Song[]]> {
  const { client } = container;
  let tracks: Song[] = [];
  let response;
  let displayMessage = '';
  const { avatar, defaultAvatarURL, id, username } = user;

  if (client.music.spotify.isSpotifyUrl(query)) {
    const item = await client.music.spotify.load(query);
    switch (item?.type) {
      case SpotifyItemType.Track:
        const track = await item.resolveYoutubeTrack();
        tracks = [
          new Song(track, Date.now(), {
            avatar,
            defaultAvatarURL,
            id,
            name: username
          })
        ];
        displayMessage = `Música enfileirada [**${item.name}**](${query}).`;
        break;
      case SpotifyItemType.Artist:
        response = await item.resolveYoutubeTracks();
        response.forEach(track =>
          tracks.push(
            new Song(track, Date.now(), {
              avatar,
              defaultAvatarURL,
              id,
              name: username
            })
          )
        );
        displayMessage = `Enfileirada **Top ${tracks.length} músicas** para [**${item.name}**](${query}).`;
        break;
      case SpotifyItemType.Album:
      case SpotifyItemType.Playlist:
        response = await item.resolveYoutubeTracks();
        response.forEach(track =>
          tracks.push(
            new Song(track, Date.now(), {
              avatar,
              defaultAvatarURL,
              id,
              name: username
            })
          )
        );
        displayMessage = `Queued **${
          tracks.length
        } tracks** from ${SpotifyItemType[item.type].toLowerCase()} [**${
          item.name
        }**](${query}).`;
        break;
      default:
        displayMessage = ":x: Não foi possível encontrar o que você estava procurando :(";
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
        displayMessage = ":x:  Não foi possível encontrar o que você estava procurando :(";
        return [displayMessage, tracks];
      case 'PLAYLIST_LOADED':
        results.tracks.forEach((track: any) =>
          tracks.push(
            new Song(track, Date.now(), {
              avatar,
              defaultAvatarURL,
              id,
              name: username
            })
          )
        );
        displayMessage = `Playlist enileirada [**${results.playlistInfo.name}**](${query}), tem um total de **${tracks.length}** músicas.`;
        break;
      case 'TRACK_LOADED':
      case 'SEARCH_RESULT':
        const [track] = results.tracks;
        tracks = [
          new Song(track, Date.now(), {
            avatar,
            defaultAvatarURL,
            id,
            name: username
          })
        ];
        displayMessage = `Queued [**${track.info.title}**](${track.info.uri})`;
        break;
    }

    return [displayMessage, tracks];
  }
}
