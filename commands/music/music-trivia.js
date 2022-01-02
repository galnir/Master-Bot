const { SlashCommandBuilder } = require('@discordjs/builders');
const { MessageEmbed } = require('discord.js');
const fs = require('fs');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('music-trivia')
    .setDescription('Engage in a fun music trivia with your friends!'),
  async execute(interaction) {
    await interaction.deferReply();
    const client = interaction.client;
    const voiceChannel = interaction.member.voice.channel;

    if (!voiceChannel) {
      return interaction.followUp(
        ':no_entry: Please join a voice channel and try again!'
      );
    }

    if (
      client.music.players.get(interaction.guildId) &&
      client.triviaMap.get(interaction.guildId)
    ) {
      return interaction.followUp(
        'Please wait until the current music trivia ends'
      );
    }

    if (
      client.music.players.get(interaction.guildId) &&
      !client.triviaMap.get(interaction.guildId)
    ) {
      return interaction.followUp(
        'Wait until the music queue gets empty and try again!'
      );
    }

    const jsonSongs = fs.readFileSync('././utils/music/songs.json', 'utf-8');

    const songsArray = getRandom(JSON.parse(jsonSongs), 5);

    const tracks = [];
    for (let i = 0; i < 5; i++) {
      const result = await client.music.rest.loadTracks(songsArray[i].url);
      tracks.push(result.tracks[0]);
    }

    const player = client.music.createPlayer(interaction.guildId);
    player.queue.channel = interaction.channel;
    await player.connect(voiceChannel.id, { deafened: true });

    const startTriviaEmbed = new MessageEmbed()
      .setColor('#ff7373')
      .setTitle(':notes: Starting Music Quiz!')
      .setDescription(
        `:notes: Get ready! There are 5 songs, you have 30 seconds to guess either the singer/band or the name of the song. Good luck!
    Vote skip the song by entering the word 'skip'.
    You can end the trivia at any point by using the end-trivia command!`
      );
    interaction.followUp({ embeds: [startTriviaEmbed] });

    player.queue.add(tracks);
    await player.setVolume(50);

    const score = new Map();

    const membersInChannel = interaction.member.voice.channel.members;
    membersInChannel.each(user => {
      if (user.user.bot) return;
      score.set(user.user.username, 0);
    });

    playTrivia(interaction.channel, player, songsArray, score);
  }
};

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

async function playTrivia(textChannel, player, songsArray, score) {
  // Randomize a number but one that won't be too close to the track ending
  const max = player.queue.tracks[0].length - 40 * 1000; // milliseconds
  const min = 10 * 1000; // milliseconds
  const randomTime = Math.floor(Math.random() * (max - min + 1)) + min;

  if (!player.playing) {
    await player.queue.start();
  } else {
    await player.queue.next();
  }

  await player.seek(randomTime);

  let songNameFound = false;
  let songSingerFound = false;

  const skippedArray = [];

  const collector = textChannel.createMessageCollector({
    time: 30000
  });

  textChannel.client.triviaMap.set(textChannel.guildId, {
    collector,
    wasTriviaEndCalled: false
  });

  collector.on('collect', msg => {
    if (!score.has(msg.author.username)) return;
    let guess = normalizeValue(msg.content);
    let title = songsArray[0].title.toLowerCase();
    let singers = songsArray[0].singers;

    if (guess === 'skip') {
      if (skippedArray.includes(msg.author.username)) {
        return;
      }
      skippedArray.push(msg.author.username);
      if (skippedArray.length > score.size * 0.6) {
        return collector.stop();
      }
      return;
    }

    // if user guessed both singer and song name
    if (
      singers.some(value => guess.includes(normalizeValue(value))) &&
      guess.includes(title)
    ) {
      if (
        (songSingerFound && !songNameFound) ||
        songNameFound & !songSingerFound
      ) {
        score.set(msg.author.username, score.get(msg.author.username) + 1);
        msg.react('☑');
        return collector.stop();
      }
      score.set(msg.author.username, score.get(msg.author.username) + 2);
      msg.react('☑');
      return collector.stop();
    }
    // if user guessed only the singer
    else if (singers.some(value => guess.includes(normalizeValue(value)))) {
      if (songSingerFound) return; // already been guessed
      songSingerFound = true;
      if (songNameFound && songSingerFound) {
        score.set(msg.author.username, score.get(msg.author.username) + 1);
        msg.react('☑');
        return collector.stop();
      }

      score.set(msg.author.username, score.get(msg.author.username) + 1);
      msg.react('☑');
    }
    // if user guessed song title
    else if (guess.includes(title)) {
      if (songNameFound) return; // already been guessed
      songNameFound = true;

      if (songNameFound && songSingerFound) {
        score.set(msg.author.username, score.get(msg.author.username) + 1);
        msg.react('☑');
        return collector.stop();
      }

      score.set(msg.author.username, score.get(msg.author.username) + 1);
      msg.react('☑');
    }
    // wrong answer
    else {
      return msg.react('❌');
    }
  });

  collector.on('end', async () => {
    const client = textChannel.client;
    const trivia = client.triviaMap.get(textChannel.guildId);
    // if stop-trivia was called
    if (trivia.wasTriviaEndCalled) {
      client.triviaMap.delete(textChannel.guildId);
      return;
    }

    const sortedScoreMap = new Map(
      [...score.entries()].sort(function (a, b) {
        return b[1] - a[1];
      })
    );

    const song = `${capitalize_Words(
      songsArray[0].singers[0]
    )}: ${capitalize_Words(songsArray[0].title)}`;

    const embed = new MessageEmbed()
      .setColor('#ff7373')
      .setTitle(`:musical_note: The song was:  ${song}`)
      .setDescription(getLeaderBoard(Array.from(sortedScoreMap.entries())));

    textChannel.send({ embeds: [embed] });

    songsArray.shift();

    if (!songsArray.length) {
      const embed = new MessageEmbed()
        .setColor('#ff7373')
        .setTitle('Music Quiz Results:')
        .setDescription(getLeaderBoard(Array.from(sortedScoreMap.entries())));

      textChannel.send({ embeds: [embed] });

      player.disconnect();
      client.music.destroyPlayer(player.guildId);
      client.triviaMap.delete(textChannel.guildId);
      return;
    }

    return playTrivia(textChannel, player, songsArray, score);
  });
}

var normalizeValue = value =>
  value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // remove diacritics
    .replace(/[^0-9a-zA-Z\s]/g, '') // remove non-alphanumeric characters
    .trim()
    .replace(/\s+/g, ' ')
    .toLowerCase(); // remove duplicate spaces

var capitalize_Words = str => {
  return str.replace(/\w\S*/g, function (txt) {
    return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
  });
};

var getLeaderBoard = arr => {
  if (!arr) return;
  if (!arr[0]) return; // issue #422
  let leaderBoard = '';

  leaderBoard = `👑   **${arr[0][0]}:** ${arr[0][1]}  points`;

  if (arr.length > 1) {
    for (let i = 1; i < arr.length; i++) {
      leaderBoard =
        leaderBoard + `\n\n   ${i + 1}: ${arr[i][0]}: ${arr[i][1]}  points`;
    }
  }
  return leaderBoard;
};
