const YouTube = require('youtube-sr').default;

module.exports.searchOne = async function searchOne(track) {
  return new Promise(async (resolve, reject) => {
    const artistsAndName = concatSongNameAndArtists(track);

    try {
      const ytResult = await YouTube.searchOne(artistsAndName);
      resolve({
        title: ytResult.title,
        url: `https://www.youtube.com/watch?v=${ytResult.id}`,
        thumbnail: {
          url: ytResult.thumbnail.url
        },
        durationFormatted: ytResult.durationFormatted,
        duration: ytResult.duration
      });
    } catch {
      reject('Something went wrong when searching for the track!');
    }
  });
};

var concatSongNameAndArtists = data => {
  let artists = '';
  data.artists.forEach(artist => (artists = artists.concat(' ', artist.name)));
  const songName = data.name;
  return `${songName} ${artists}`;
};
