const { MessageEmbed } = require('discord.js');
const { Command } = require('discord.js-commando');
const db = require('quick.db');

module.exports = class WecomeMessageCommand extends Command {
  constructor(client) {
    super(client, {
      name: 'welcome-message',
      memberName: 'welcome-message',
      aliases: ['welcomemessage', 'welcome'],
      group: 'guild',
      guildOnly: true,
      userPermissions: ['ADMINISTRATOR'],
      clientPermissions: ['ADMINISTRATOR'],
      description:
        'Allows you to toggle the welcome message for new members that join the server.',
      args: [
        {
          key: 'choice',
          prompt: 'Do you want me to welcome new members? Type Yes or No',
          type: 'string',
          oneOf: ['yes', 'no', 'enable', 'disable']
        }
      ]
    });
  }

  run(message, { choice }) {
    if (choice.toLowerCase() == 'enable') choice = 'yes';

    if (choice.toLowerCase() == 'disable') choice = 'no';

    db.set(
      `${message.member.guild.id}.serverSettings.welcomeMsg.status`,
      choice.toLowerCase()
    );
    if (choice.toLowerCase() == 'yes') {
      if (
        !db.get(message.member.guild.id).serverSettings ||
        !db.get(message.member.guild.id).serverSettings.welcomeMsg
      ) {
        //embedTitle
        //saving
        db.set(
          `${message.member.guild.id}.serverSettings.welcomeMsg.embedTitle`,
          'default'
        );
        //topImageText
        //saving
        db.set(
          `${message.member.guild.id}.serverSettings.welcomeMsg.topImageText`,
          'default'
        );
        //bottomImageText
        //saving
        db.set(
          `${message.member.guild.id}.serverSettings.welcomeMsg.bottomImageText`,
          `default`
        );
        //wallpaperURL
        //saving
        db.set(
          `${message.member.guild.id}.serverSettings.welcomeMsg.wallpaperURL`,
          `default`
        );
        //imageWidth
        //saving
        db.set(
          `${message.member.guild.id}.serverSettings.welcomeMsg.imageWidth`,
          700
        );
        //imageHeight
        //saving
        db.set(
          `${message.member.guild.id}.serverSettings.welcomeMsg.imageHeight`,
          250
        );
      }
      // Report Back Current Settings
      const embed = new MessageEmbed()
        .setTitle(
          `:white_check_mark: Welcome Message ***Enabled*** on ${message.member.guild.name}`
        )
        .setDescription(
          'You can run the Join Command to see what it will look like!'
        )
        .addField(
          `Title: `,
          db.get(
            `${message.member.guild.id}.serverSettings.welcomeMsg.embedTitle`
          )
        )
        .addField(
          `Upper Text: `,
          db.get(
            `${message.member.guild.id}.serverSettings.welcomeMsg.topImageText`
          )
        )
        .addField(
          `Lower Text: `,
          db.get(
            `${message.member.guild.id}.serverSettings.welcomeMsg.bottomImageText`
          )
        )
        .addField(
          `Image Path: `,
          db.get(
            `${message.member.guild.id}.serverSettings.welcomeMsg.wallpaperURL`
          )
        )
        .addField(
          `Image Size: `,
          db.get(
            `${message.member.guild.id}.serverSettings.welcomeMsg.imageWidth`
          ) +
            ` X ` +
            db.get(
              `${message.member.guild.id}.serverSettings.welcomeMsg.imageHeight`
            )
        )
        .setColor('#420626');

      return message.say(embed);
    }
    // Report Settings are Disabled
    if (choice.toLowerCase() == 'no')
      message.say(
        `Welcome Message ***Disabled*** on ${message.member.guild.name}`
      );
  }
};
