const { SlashCommandBuilder } = require('@discordjs/builders');
const { SpotifyItemType } = require('@lavaclient/spotify');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('play')
    .setDescription('Play any song or playlist from YouTube and Spotify!')
    .addStringOption(option =>
      option
        .setName('query')
        .setDescription('What song or playlist would you like to listen to?')
        .setRequired(true)
    ),
  async execute(interaction) {
    interaction.deferReply({
      fetchReply: true
    });
    const client = interaction.client;
    const voiceChannel = interaction.member.voice.channel;
    if (!voiceChannel) {
      return interaction.followUp('Join a voice channel and try again!');
    }
    const query = interaction.options.get('query').value; // the user's query

    let player = client.music.players.get(interaction.guildId);
    if (player && player.channelId !== voiceChannel.id) {
      return interaction.followUp(`Join <#${player.channelId}`);
    }

    let tracks = [];
    let displayMessage = '';

    if (client.music.spotify.isSpotifyUrl(query)) {
      const item = await client.music.spotify.load(query);
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
          return interaction.followUp({
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
          return interaction.followUp({
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

    // create a player if missing
    if (!player) {
      player = client.music.createPlayer(interaction.guildId);
      player.queue.channel = interaction.channel;
      await player.connect(voiceChannel.id, { deafened: true });
    }

    const started = player.playing || player.paused;

    await interaction.followUp(displayMessage);

    player.queue.add(tracks, {
      requester: interaction.user.id
    });
    if (!started) {
      await player.setVolume(50); // default 100 is too much, todo: import this from db at startup
      await player.queue.start();
    }
  }
};
