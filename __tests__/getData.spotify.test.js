const { getData } = require('spotify-url-info');

it('should return data from spotify', () => {
  return getData(
    'https://open.spotify.com/track/4fzsfWzRhPawzqhX8Qt9F3?si=c7359b61c4404fdb'
  ).then(data => {
    expect(data.artists[0].name).toBe('Kanye West');
    expect(data.name).toBe('Stronger');
  });
});
