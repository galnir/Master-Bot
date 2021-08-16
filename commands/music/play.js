const { SlashCommandBuilder } = require('@discordjs/builders');
const { MessageEmbed } = require('discord.js');
const Youtube = require('simple-youtube-api');
const ytdl = require('ytdl-core');
const ytsr = require('ytsr');
const { getData } = require('spotify-url-info');
const { youtubeAPI } = require('../../config.json');
let {
  playLiveStreams,
  playVideosLongerThan1Hour,
  maxQueueLength,
  AutomaticallyShuffleYouTubePlaylists,
  LeaveTimeOut,
  MaxResponseTime,
  deleteOldPlayMessage
} = require('../../options.json');
const Pagination = require('discord-paginationembed');
const Member = require('../../utils/models/Member');

const youtube = new Youtube(youtubeAPI);
// Check If Options are Valid
if (typeof playLiveStreams !== 'boolean') playLiveStreams = true;
if (typeof maxQueueLength !== 'number' || maxQueueLength < 1) {
  maxQueueLength = 1000;
}
if (typeof LeaveTimeOut !== 'number') {
  LeaveTimeOut = 90;
}
if (typeof MaxResponseTime !== 'number') {
  MaxResponseTime = 30;
}
if (typeof AutomaticallyShuffleYouTubePlaylists !== 'boolean') {
  AutomaticallyShuffleYouTubePlaylists = false;
}
if (typeof playVideosLongerThan1Hour !== 'boolean') {
  playVideosLongerThan1Hour = true;
}
if (typeof deleteOldPlayMessage !== 'boolean') {
  deleteOldPlayMessage = false;
}

// If the Options are outside of min or max then use the closest number
LeaveTimeOut = LeaveTimeOut > 600 ? 600 : LeaveTimeOut &&
  LeaveTimeOut < 2 ? 1 : LeaveTimeOut; // prettier-ignore

MaxResponseTime = MaxResponseTime > 150 ? 150 : MaxResponseTime &&
  MaxResponseTime < 5 ? 5 : MaxResponseTime; // prettier-ignore

module.exports = {
  data: new SlashCommandBuilder()
    .setName('play')
    .setDescription('Play any song or playlist from YouTube or Spotify!')
    .addStringOption(option =>
      option
        .setName('query')
        .setDescription(
          ':notes: What song or playlist would you like to listen to? Add -s to shuffle a playlist'
        )
        .setRequired(true)
    ),
  async execute(interaction) {
    // Make sure that only users present in a voice channel can use 'play'
    if (!interaction.member.voice.channel) {
      interaction.reply(
        ':no_entry: Please join a voice channel and try again!'
      );
      return;
    }
    // Make sure there isn't a 'music-trivia' running
    if (interaction.guild.triviaData.isTriviaRunning) {
      interaction.reply(':x: Please try after the trivia has ended!');
      return;
    }
    let query = interaction.options.get('query').value;
    //Parse query to check for flags

    var splitQuery = query.split(' ');
    var shuffleFlag = splitQuery[splitQuery.length - 1] === '-s';
    var reverseFlag = splitQuery[splitQuery.length - 1] === '-r';
    var nextFlag = splitQuery[splitQuery.length - 1] === '-n';
    var jumpFlag = splitQuery[splitQuery.length - 1] === '-j';

    if (shuffleFlag || reverseFlag || nextFlag || jumpFlag) splitQuery.pop();
    query = splitQuery.join(' ');

    // Check if the query is actually a saved playlist name

    const userData = await Member.findOne({
      memberId: interaction.member.id
    }).exec();
    console.log(userData);
  }
};
