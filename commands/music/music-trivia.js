const { SlashCommandBuilder } = require('@discordjs/builders');
const {
  joinVoiceChannel,
  VoiceConnectionStatus,
  entersState
} = require('@discordjs/voice');
const { MessageEmbed } = require('discord.js');
const fs = require('fs');
const TriviaPlayer = require('../../utils/music/TriviaPlayer');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('music-trivia')
    .setDescription('Engage in a music quiz with your friends!')
    .addStringOption(option =>
      option
        .setName('length')
        .setDescription('How many songs would you like the trivia to have?')
    ),
  async execute(interaction) {
    await interaction.deferReply();
    const voiceChannel = interaction.member.voice.channel;
    if (!voiceChannel) {
      return interaction.followUp(
        ':no_entry: Please join a voice channel and try again!'
      );
    }

    if (interaction.client.playerManager.get(interaction.guildId)) {
      return interaction.followUp(
        `You can't use this while a track is playing!`
      );
    }

    if (interaction.client.triviaManager.get(interaction.guildId)) {
      return interaction.followUp('There is already a trivia in play!');
    }

    const numberOfSongs = interaction.options.get('length')
      ? interaction.options.get('length').value
      : 5;

    const jsonSongs = fs.readFileSync(
      '././resources/music/musictrivia.json',
      'utf8'
    );
    const videoDataArray = JSON.parse(jsonSongs).songs;
    // get random numberOfSongs videos from the array

    const randomLinks = getRandom(videoDataArray, numberOfSongs);
    interaction.client.triviaManager.set(
      interaction.guildId,
      new TriviaPlayer()
    );

    const triviaPlayer = interaction.client.triviaManager.get(
      interaction.guildId
    );

    randomLinks.forEach(link => {
      triviaPlayer.queue.push({
        url: link.url,
        singer: link.singer,
        title: link.title,
        voiceChannel
      });
    });

    const membersInChannel = interaction.member.voice.channel.members;

    membersInChannel.each(user => {
      if (user.user.bot) return;
      triviaPlayer.score.set(user.user.username, 0);
    });

    // play and display embed that says trivia started and how many songs are going to be
    handleSubscription(interaction, triviaPlayer);
  }
};

async function handleSubscription(interaction, player) {
  const queue = player.queue;
  let voiceChannel = queue[0].voiceChannel;

  const connection = joinVoiceChannel({
    channelId: voiceChannel.id,
    guildId: interaction.guild.id,
    adapterCreator: interaction.guild.voiceAdapterCreator
  });

  player.textChannel = interaction.channel;
  player.passConnection(connection);
  try {
    await entersState(player.connection, VoiceConnectionStatus.Ready, 10000);
  } catch (err) {
    console.error(err);
    await interaction.followUp({ content: 'Failed to join your channel!' });
    return;
  }
  player.process(player.queue);

  const startTriviaEmbed = new MessageEmbed()
    .setColor('#ff7373')
    .setTitle(':notes: Starting Music Quiz!')
    .setDescription(
      `:notes: Get ready! There are ${queue.length} songs, you have 30 seconds to guess either the singer/band or the name of the song. Good luck!
    Vote skip the song by entering the word 'skip'.
    You can end the trivia at any point by using the end-trivia command!`
    );
  return interaction.followUp({ embeds: [startTriviaEmbed] });
}

function getRandom(arr, n) {
  var result = new Array(n),
    len = arr.length,
    taken = new Array(len);
  if (n > len)
    throw new RangeError('getRandom: more elements taken than available!');
  while (n--) {
    var x = Math.floor(Math.random() * len);
    // prettier-ignore
    result[n] = arr[(x in taken) ? taken[x] : x];
    // prettier-ignore
    taken[x] = (--len in taken) ? taken[len] : len;
    // prettier-ignore-end
  }
  return result;
}
