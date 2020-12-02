const { Command } = require('discord.js-commando');
const { twitchClientID, twitchClientSecret } = require('../../config.json');
const { MessageEmbed } = require('discord.js');
const Twitch = require('simple-twitch-api');
const db = require('quick.db');

if (twitchClientID == null || twitchClientSecret == null)
  return console.log(
    'INFO: TwitchAnnouncer command removed from the list.\nMake sure you have twitchClientID and twitchClientSecret in your config.json to use Twitch Features'
  );
module.exports = class TwitchAnnouncerCommand extends Command {
  constructor(client) {
    super(client, {
      name: 'twitch-announcer',
      memberName: 'twitch-announcer',
      aliases: ['twitch-announcer', 'twitchanounce', 'tac'],
      group: 'guild',
      guildOnly: true,
      userPermissions: ['ADMINISTRATOR'],
      clientPermissions: ['SEND_MESSAGES'],
      description: 'Allows you to switch Twitch Announcer On and Off.',
      args: [
        {
          key: 'textRaw',
          prompt:
            'Would You like to ***Enable*** or ***Disable*** the Twitch Announcer?',
          type: 'string',
          oneOf: ['enable', 'disable']
        }
      ]
    });
  }

  async run(message, { textRaw }) {
    var Twitch_DB = new db.table('Twitch_DB');
    if (Twitch_DB.get(`${message.guild.id}.twitchAnnouncer`) == undefined)
      return message.reply(
        `:no_entry: No Settings were found, Please run twitch-announcer-settings command first`
      );
    var textFiltered = textRaw.toLowerCase();
    if (textFiltered == 'disable') {
      Twitch_DB.set(`${message.guild.id}.twitchAnnouncer.status`, 'disable');
      return message.say('Announcer has been Disabled.');
    }
    if (textFiltered == 'enable') {
      Twitch_DB.set(`${message.guild.id}.twitchAnnouncer.status`, 'offline');
      message.say(`:white_check_mark: Announcer has been Enabled!
      Streamer: ***${Twitch_DB.get(message.guild.id).twitchAnnouncer.name}***
      Channel: ***${Twitch_DB.get(message.guild.id).twitchAnnouncer.channel}***
      Timer: ***${
        Twitch_DB.get(message.guild.id).twitchAnnouncer.timer
      }*** minutes`);

      var Ticker = setInterval(function() {
        if (
          Twitch_DB.get(`${message.guild.id}.twitchAnnouncer.status`) ==
          'disable'
        ) {
          clearInterval(Ticker);
        }

        for (let i = 0; i <= Twitch_DB.all().length; ++i) {
          let anouncedChannel = message.guild.channels.cache.find(
            c =>
              c.name == Twitch_DB.get(message.guild.id).twitchAnnouncer.channel
          );

          const SCOPE = 'user:read:email';
          Twitch.getToken(twitchClientID, twitchClientSecret, SCOPE).then(
            async result => {
              const access_token = result.access_token;

              let user = await Twitch.getUserInfo(
                access_token,
                twitchClientID,
                Twitch_DB.get(message.guild.id).twitchAnnouncer.name
              );

              if (user.status == `400`) clearInterval(Ticker); // Bad Request Get out of loop

              if (user.status == `429`) return; // Should Trigger once per limit hit at 2 minute intervals

              if (user.status == `503`) clearInterval(Ticker); // Twitch Service is Down Get out of Loop

              if (user.data[0] == null) clearInterval(Ticker); // Twitch returned Nothing Get out of Loop

              const user_id = user.data[0].id;
              let streamInfo = await Twitch.getStream(
                access_token,
                twitchClientID,
                user_id
              );

              if (streamInfo.data[0])
                var gameInfo = await Twitch.getGames(
                  access_token,
                  twitchClientID,
                  streamInfo.data[0].game_id
                );

              if (!streamInfo.data[0])
                return Twitch_DB.set(
                  `${message.guild.id}.twitchAnnouncer.status`,
                  'offline'
                );

              if (
                Twitch_DB.get(`${message.guild.id}.twitchAnnouncer.status`) ==
                'offline'
              )
                Twitch_DB.set(
                  `${message.guild.id}.twitchAnnouncer.status`,
                  'online'
                );

              if (
                Twitch_DB.get(`${message.guild.id}.twitchAnnouncer.status`) ==
                'online'
              ) {
                Twitch_DB.set(
                  `${message.guild.id}.twitchAnnouncer.status`,
                  'sent'
                );

                var announcerEmbed = new MessageEmbed()
                  .setAuthor(
                    'Twitch Announcement',
                    user.data[0].profile_image_url,
                    'https://twitch.tv/' + user.data[0].display_name
                  )
                  .setURL('https://twitch.tv/' + user.data[0].display_name)
                  .setTitle(
                    'Looks like ' + user.data[0].display_name + ' is: Online!'
                  )
                  .addField('Stream Title:', streamInfo.data[0].title)
                  .addField(
                    'Currently Playing:',
                    streamInfo.data[0].game_name,
                    true
                  )
                  .addField('Viewers:', streamInfo.data[0].viewer_count, true)
                  .setColor('#6441A4')
                  .setFooter(
                    'Stream Started',
                    'https://static.twitchcdn.net/assets/favicon-32-d6025c14e900565d6177.png' // Official icon link from Twitch.tv
                  )
                  .setImage(
                    streamInfo.data[0].thumbnail_url
                      .replace(/{width}x{height}/g, '1280x720')
                      .concat('?r=' + Math.floor(Math.random() * 10000 + 1)) // to ensure the image updates when refreshed
                  )
                  .setTimestamp(streamInfo.data[0].started_at);
                if (user.data[0].broadcaster_type == '')
                  announcerEmbed.addField('Rank:', 'BASE!', true);
                else {
                  announcerEmbed.addField(
                    'Rank:',
                    user.data[0].broadcaster_type.toUpperCase() + '!',
                    true
                  );
                }
                if (gameInfo.data[0].box_art_url.search(/.jpg/g))
                  announcerEmbed.setThumbnail(user.data[0].profile_image_url);
                else
                  announcerEmbed.setThumbnail(
                    gameInfo.data[0].box_art_url.replace(
                      /-{width}x{height}/g,
                      ''
                    )
                  );

                anouncedChannel.send(
                  'Hey Everyone, ' + user.data[0].display_name + ' is Online!'
                ),
                  anouncedChannel.send(announcerEmbed);
              }
            }
          );
        }
      }, Twitch_DB.get(message.guild.id).twitchAnnouncer.timer * 60 * 1000);
    }
  }
};
