const { Command } = require('discord.js-commando');
const { MessageEmbed } = require('discord.js');
const fetch = require('node-fetch');
const cheerio = require('cheerio');
const { geniusLyricsAPI } = require('../../config.json');

module.exports = class LyricsCommand extends Command {
  constructor(client) {
    super(client, {
      name: 'lyrics',
      aliases: ["lr"],
      memberName: 'lyrics',
      description: 'Get lyrics of any song.',
      group: 'music',
      throttling: {
        usages: 1,
        duration: 5
      },
      args: [
        {
          key: 'songName',
          default: '',
          type: 'string',
          prompt: 'What song lyrics would you like to searching?'
        }
      ],
      throttling: {
	      usages: 1,
	      duration: 10
      }
    });
  }
  async run(message, { songName }) {
    if (
      songName == '' &&
      message.guild.musicData.isPlaying &&
      !message.guild.triviaData.isTriviaRunning
    ) {
      songName = message.guild.musicData.nowPlaying.title;
    } else if (songName == '' && message.guild.triviaData.isTriviaRunning) {
      return message.say('Please try again after the trivia has ended');
    } else if (songName == '' && !message.guild.musicData.isPlaying) {
      return message.say(
        'There is no song playing right now, please try again with a song name or play a song first'
      );
    }
    const sentMessage = await message.embed({color: "#5dc4ff", description: 'Searching for the lyrics'});
    var url = `https://api.genius.com/search?q=${encodeURI(songName)}`;

    const headers = {
      Authorization: `Bearer ${geniusLyricsAPI}`
    };
    try {
      var body = await fetch(url, { headers });
      var result = await body.json();
      const songID = result.response.hits[0].result.id;

      url = `https://api.genius.com/songs/${songID}`;
      body = await fetch(url, { headers });
      result = await body.json();

      const song = result.response.song;

      let lyrics = await getLyrics(song.url);
      lyrics = lyrics.replace(/(\[.+\])/g, '');
      let urll = song.url;
      if (lyrics.length > 4095) {
      const errembed = new MessageEmbed()
             .setColor(0x5dc4ff)
             .setAuthor('Genius', 'https://lh3.googleusercontent.com/e6-dZlTM-gJ2sFxFFs3X15O84HEv6jc9PQGgHtVTn7FP6lUXeEAkDl9v4RfVOwbSuQ')
             .setTitle('Error! Lyrics too long!')
             .setDescription(`Visit the source instead. \nSource: **[Click me!](${urll})**`)
             .setFooter('Lyrics is > 4059')
        return message.say(errembed);
        }
      
      if (lyrics.length < 2048) {
        const lyricsEmbed = new MessageEmbed()
          .setAuthor('Genius', 'https://lh3.googleusercontent.com/e6-dZlTM-gJ2sFxFFs3X15O84HEv6jc9PQGgHtVTn7FP6lUXeEAkDl9v4RfVOwbSuQ')
          .setURL(urll)
          .setTitle(`**[ ${song.full_title} ]**`)
          .setThumbnail(song.header_image_thumbnail_url)
          .setColor('#5dc4ff')
          .setDescription(`${lyrics.trim()} \n\n(\_Source\_ : ${urll})`);
        return sentMessage.edit('', lyricsEmbed);
      } else {
        
      let pages = [`${lyrics.slice(0, 2048)}`, `${lyrics.slice(2048, lyrics.length)}`]  
      let page = 1; 
    
      let embed = new MessageEmbed()
      .setAuthor('Genius', 'https://lh3.googleusercontent.com/e6-dZlTM-gJ2sFxFFs3X15O84HEv6jc9PQGgHtVTn7FP6lUXeEAkDl9v4RfVOwbSuQ')
      .setURL(urll)
      .setTitle(`**[ ${song.full_title} ]**`)
      .setThumbnail(song.header_image_thumbnail_url)
      .setColor("#5dc4ff")
      .setFooter(`Page ${page} of ${pages.length}`)
      .setDescription(pages[page-1])
      message.channel.send(embed).then(msg => {
	      
      		msg.react('⬅').then( r => {
      		msg.react('➡')
			
    const backwardsFilter = (reaction, user) => reaction.emoji.name === '⬅' && user.id === message.author.id;
    const forwardsFilter = (reaction, user) => reaction.emoji.name === '➡' && user.id === message.author.id;

    const backwards = msg.createReactionCollector(backwardsFilter, {timer: 6000});
    const forwards = msg.createReactionCollector(forwardsFilter, {timer: 6000});
 
      backwards.on('collect', r => {
	      if (page === 1) return;
	      page--;
	      embed.setDescription(pages[page-1]);
	      embed.setFooter(`Page ${page} of ${pages.length}`);
	      msg.reactions.resolve("⬅").users.remove(message.author.id)
	      msg.edit(embed)

      })

      forwards.on('collect', r => {
	      if (page === pages.length) return;
	      page++;
	      embed.setDescription(pages[page-1]);
	      embed.setFooter(`Page ${page} of ${pages.length}`);
	      msg.reactions.resolve("➡").users.remove(message.author.id)
	      msg.edit(embed);
        })
      })
    })
        sentMessage.delete();
        return;
      }
    } catch (e) {
      	console.error(e);
      	return sentMessage.edit({embed: {color: "#5dc4ff", description: 'Something went wrong, can you be more specific?'}});
    }
    async function getLyrics(url) {
      	const response = await fetch(url);
      	const text = await response.text();
      	const $ = cheerio.load(text);
      	return $('.lyrics').text().trim();
    }
  }
};
