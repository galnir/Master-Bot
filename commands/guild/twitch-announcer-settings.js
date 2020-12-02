const { Command } = require('discord.js-commando');
const { twitchClientID, twitchClientSecret } = require('../../config.json');
const Twitch = require('simple-twitch-api');
const db = require('quick.db');

if (twitchClientID == null || twitchClientSecret == null)
  return console.log(
    'INFO: TwitchAnnouncerSettings command removed from the list. \nMake sure you have twitchClientID and twitchClientSecret in your config.json to use Twitch Features'
  );
module.exports = class TwitchAnnouncerSettingsCommand extends Command {
  constructor(client) {
    super(client, {
      name: 'twitch-announcer-settings',
      memberName: 'twitch-announcer-settings',
      aliases: ['twitch-announcer-config', 'twitchanouncesetting', 'tas'],
      group: 'guild',
      guildOnly: true,
      userPermissions: ['ADMINISTRATOR'],
      clientPermissions: ['SEND_MESSAGES'],
      description: 'Setup an auto twitch announcer.',
      throttling: {
        usages: 45, // 45 queries
        duration: 60 // every 60 seconds
      },
      args: [
        {
          key: 'textRaw',
          prompt: "Who's stream do you want to announce?",
          type: 'string'
        },
        {
          key: 'streamChannel',
          prompt: 'What channel would you like my to announe in?',
          type: 'string'
          // validate: streamChannel => streamChannel = message.guild.channels.cache.find(
          //   c => c.name == streamChannel
          // )
        },
        {
          key: 'timer',
          prompt: 'How Often do you want me to check? 1 to 60 Minute',
          type: 'integer',
          default: 2,
          validate: function validate(timer) {
            return timer <= 60 && timer >= 0;
          }
        }
      ]
    });
  }

  async run(message, { textRaw, streamChannel, timer }) {
    let anouncedChannel = message.guild.channels.cache.find(
      c => c.name == streamChannel
    );
    if (!anouncedChannel)
      return message.reply(':x: ' + streamChannel + ' could not be found.');

    const SCOPE = 'user:read:email';
    Twitch.getToken(twitchClientID, twitchClientSecret, SCOPE).then(
      async result => {
        const access_token = result.access_token;

        if (access_token == null)
          return (
            console.log(
              'Error: Double check the values of twitchCLIENTID and twitchClientSecret in your config.json'
            ) + message.reply(':x: Something went wrong!')
          );

        const textFiltered = textRaw.replace(/https\:\/\/twitch.tv\//g, '');

        const user = await Twitch.getUserInfo(
          access_token,
          twitchClientID,
          textFiltered
        );

        if (user.status == `400`)
          return message.reply(
            `:x: ***Error***: ${textFiltered}, returned a Bad Request.\nSettings were not saved.`
          );

        if (user.status == `429`)
          return message.reply(
            `:x: ***Error***: Twitch Limit Reach try again later.\nSettings were not saved.`
          );

        if (user.status == `503`)
          return message.reply(
            `:x: ***Error***: Twitch Service is Unavailable.\nSettings were not saved.`
          );

        if (user.data[0] == null)
          return (
            message.delete() +
            message.reply(
              `:x: Streamer ${textFiltered} was not found, Please try again.\nSettings were not saved.`
            )
          );

        var Twitch_DB = new db.table('Twitch_DB');
        Twitch_DB.set(`${message.guild.id}.twitchAnnouncer`, {
          name: user.data[0].display_name,
          channel: streamChannel,
          status: 'offline',
          timer: timer
        });
        message.say(`:white_check_mark: Your settings were saved!
        Streamer: ***${Twitch_DB.get(message.guild.id).twitchAnnouncer.name}***
        Channel: ***${
          Twitch_DB.get(message.guild.id).twitchAnnouncer.channel
        }***
        Timer: ***${
          Twitch_DB.get(message.guild.id).twitchAnnouncer.timer
        }*** minute(s)`);
      }
    );
  }
};
