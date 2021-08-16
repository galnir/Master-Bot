module.exports = function() {
  return {
    musicData: {
      queue: [],
      queueHistory: [],
      isPlaying: false,
      isPreviousTrack: false,
      nowPlaying: null,
      songDispatcher: null,
      skipTimer: false, // only skip if user used leave command
      loopSong: false,
      loopQueue: false,
      volume: 1
    },
    triviaData: {
      isTriviaRunning: false,
      wasTriviaEndCalled: false,
      triviaQueue: [],
      triviaScore: new Map()
    },
    twitchData: {
      Interval: null,
      embedStatus: null,
      isRunning: false
    },
    gameData: {
      connect4Players: new Map(),
      tictactoePlayers: new Map()
    }
  };
};
