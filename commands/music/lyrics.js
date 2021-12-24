const { SlashCommandBuilder } = require('@discordjs/builders');
const { MessageEmbed } = require('discord.js');
const { PaginatedMessage } = require('@sapphire/discord.js-utilities');
const fetch = require('node-fetch');
const cheerio = require('cheerio');
const { geniusLyricsAPI } = require('../../config.json');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('lyrics')
    .setDescription(
      'Get the lyrics of any song or the lyrics of the currently playing song!'
    )
    .addStringOption(option => {
      return option
        .setName('title')
        .setDescription(':mag: What song lyrics would you like to get?');
    }),
  async execute(interaction) {
    interaction.deferReply({
      fetchReply: true
    });
    const client = interaction.client;
    const player = client.music.players.get(interaction.guildId);
    const titleObject = interaction.options.get('title');

    if (!player && !titleObject) {
      return interaction.followUp(
        'Please provide a valid song name or start playing one and try again!'
      );
    }

    if (!titleObject) {
      var title = player.queue.current.title;
    } else {
      var title = titleObject.value;
    }

    try {
      const url = await searchSong(cleanSongName(title));
      const songPageURL = await getSongPageURL(url);
      const lyrics = await getLyrics(songPageURL);
      const lyricsIndex = Math.round(lyrics.length / 4096) + 1;

      const paginatedLyrics = new PaginatedMessage({
        template: new MessageEmbed()
          .setColor('#ff0000')
          .setTitle(cleanSongName(title))
          .setFooter('Provided by genius.com')
      });

      for (let i = 1; i <= lyricsIndex; ++i) {
        let b = i - 1;
        if (lyrics.trim().slice(b * 4096, i * 4096).length !== 0) {
          paginatedLyrics.addPageEmbed(embed => {
            return embed.setDescription(lyrics.slice(b * 4096, i * 4096));
          });
        }
      }
      const message = {
        author: {
          id: interaction.member.id,
          bot: interaction.user.bot
        },
        channel: interaction.channel
      };
      await interaction.followUp('Lyrics generated');
      paginatedLyrics.run(message);
    } catch (e) {
      console.log(e);
      return interaction.followUp(
        'Something when wrong when trying to fetch lyrics :('
      );
    }
  }
};

function cleanSongName(songName) {
  return songName
    .replace(/ *\([^)]*\) */g, '')
    .replace(
      /([\u2700-\u27BF]|[\uE000-\uF8FF]|\uD83C[\uDC00-\uDFFF]|\uD83D[\uDC00-\uDFFF]|[\u2011-\u26FF]|\uD83E[\uDD10-\uDDFF])/g,
      ''
    );
}

function searchSong(query) {
  return new Promise(async function (resolve, reject) {
    const searchURL = `https://api.genius.com/search?q=${encodeURI(query)}`;
    const headers = {
      Authorization: `Bearer ${geniusLyricsAPI}`
    };
    try {
      const body = await fetch(searchURL, { headers });
      const result = await body.json();
      const songPath = result.response.hits[0].result.api_path;
      resolve(`https://api.genius.com${songPath}`);
    } catch (e) {
      reject(':x: No song has been found for this query');
    }
  });
}

function getSongPageURL(url) {
  return new Promise(async function (resolve, reject) {
    const headers = {
      Authorization: `Bearer ${geniusLyricsAPI}`
    };
    try {
      const body = await fetch(url, { headers });
      const result = await body.json();
      if (!result.response.song.url) {
        reject(':x: There was a problem finding a URL for this song');
      } else {
        resolve(result.response.song.url);
      }
    } catch (e) {
      console.log(e);
      reject('There was a problem finding a URL for this song');
    }
  });
}

function getLyrics(url) {
  return new Promise(async function (resolve, reject) {
    try {
      const response = await fetch(url);
      const text = await response.text();
      const $ = cheerio.load(text);
      let lyrics = $('.lyrics').text().trim();
      if (!lyrics) {
        $('.Lyrics__Container-sc-1ynbvzw-6').find('br').replaceWith('\n');
        lyrics = $('.Lyrics__Container-sc-1ynbvzw-6').text();
        if (!lyrics) {
          reject(
            'There was a problem fetching lyrics for this song, please try again'
          );
        } else {
          resolve(lyrics.replace(/(\[.+\])/g, ''));
        }
      } else {
        resolve(lyrics.replace(/(\[.+\])/g, ''));
      }
    } catch (e) {
      console.log(e);
      reject(
        'There was a problem fetching lyrics for this song, please try again'
      );
    }
  });
}
