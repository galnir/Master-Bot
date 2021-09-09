const { searchOne } = require('../utils/music/searchOne');

it('should return data', () => {
  return searchOne(mockData).then(video => {
    expect(video).toHaveProperty('title');
    expect(video).toHaveProperty('url');
    expect(video).toHaveProperty('thumbnail');
    expect(video).toHaveProperty('durationFormatted');
    expect(video).toHaveProperty('duration');
  });
});

const mockData = {
  artists: [
    {
      name: 'Kanye West',
      type: 'artist'
    }
  ],
  name: 'Stronger'
};
