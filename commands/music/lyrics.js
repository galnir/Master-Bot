const { SlashCommandBuilder } = require('@discordjs/builders');
const { MessageEmbed } = require('discord.js');
const { PaginatedMessage } = require('@sapphire/discord.js-utilities');
const { GeniusLyrics } = require('genius-discord-lyrics');
const { geniusLyricsAPI } = require('../../config.json');

const genius = new GeniusLyrics(geniusLyricsAPI);

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
    const client = interaction.client;

    if (client.triviaMap.has(interaction.guildId)) {
      return interaction.reply(
        'You cannot use this command while a music trivia is playing!'
      );
    }

    await interaction.deferReply({
      fetchReply: true
    });
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
      const lyrics = await genius.fetchLyrics(title);
      const lyricsIndex = Math.round(lyrics.length / 4096) + 1;
      const paginatedLyrics = new PaginatedMessage({
        template: new MessageEmbed()
          .setColor('#ff0000')
          .setTitle(title)
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
