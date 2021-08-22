const {
  AudioPlayerStatus,
  createAudioPlayer,
  entersState,
  VoiceConnectionDisconnectReason,
  VoiceConnectionStatus,
  createAudioResource,
  StreamType
} = require('@discordjs/voice');
const { setTimeout } = require('timers');
const { promisify } = require('util');
const ytdl = require('ytdl-core');

const wait = promisify(setTimeout);

class MusicPlayer {
  constructor() {
    this.connection = null;
    this.audioPlayer = createAudioPlayer();
    this.queue = [];
    this.queueHistory = [];
    this.isPreviousTrack = false;
    this.skipTimer = false;
    this.loopSong = false;
    this.loopQueue = false;
    this.volume = 1;
    this.queueLock = false;
  }

  passConnection(connection) {
    this.connection = connection;
    this.connection.on('stateChange', async (_, newState) => {
      if (newState.status === VoiceConnectionStatus.Disconnected) {
        if (
          newState.reason === VoiceConnectionDisconnectReason.WebSocketClose &&
          newState.closeCode === 4014
        ) {
          try {
            await entersState(
              this.connection,
              VoiceConnectionStatus.Connecting,
              5000
            );
          } catch {
            this.connection.destroy();
          }
        } else if (this.connection.rejoinAttemps < 5) {
          await wait((this.connection.rejoinAttemps + 1) * 5000);
          this.connection.rejoin();
        } else {
          this.connection.destroy();
        }
      } else if (newState.status === VoiceConnectionStatus.Destroyed) {
        // when leaving
        this.stop();
      } else if (
        newState.status === VoiceConnectionStatus.Connecting ||
        newState.status === VoiceConnectionStatus.Signalling
      ) {
        try {
          await entersState(
            this.connection,
            VoiceConnectionStatus.Ready,
            20000
          );
        } catch {
          if (this.connection.state.status !== VoiceConnectionStatus.Destroyed)
            this.connection.destroy();
        }
      }
    });

    this.audioPlayer.on('stateChange', (oldState, newState) => {
      if (
        newState.status === AudioPlayerStatus.Idle &&
        oldState.status !== AudioPlayerStatus.Idle
      ) {
        // Finished playing audio
        if (this.queue.length) {
          this.process(this.queue);
        }
      } else if (newState.status === AudioPlayerStatus.Playing) {
        // started playing
        // display embed
      }
    });

    this.audioPlayer.on('error', error => {
      console.error(error);
    });

    this.connection.subscribe(this.audioPlayer);
  }

  stop() {
    this.queue.length = 0;
    this.nowPlaying = null;
    this.skipTimer = false;
    this.isPreviousTrack = false;
    this.loopSong = false;
    this.loopQueue = false;
    this.audioPlayer.stop(true);
  }

  async process(queue) {
    if (
      this.queueLock ||
      this.audioPlayer.state.status !== AudioPlayerStatus.Idle ||
      this.queue.length === 0
    ) {
      return;
    }
    this.queueLock = true;

    const song = this.queue.shift();

    try {
      //const resource = await this.createAudioResource(song.url);
      const stream = ytdl(song.url, {
        filter: 'audio',
        quality: 'highestaudio',
        highWaterMark: 1 << 25
      });
      const resource = createAudioResource(stream, {
        inputType: StreamType.Arbitrary
      });
      this.audioPlayer.play(resource);
      this.queueLock = false;
    } catch (err) {
      console.error(err);
      this.queueLock = false;
      return this.process(queue);
    }
  }
}

module.exports = MusicPlayer;
