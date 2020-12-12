const { MessageEmbed, MessageAttachment } = require('discord.js');
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
      examples: ['!welcome yes', '!welcome no'],
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

    if (
      db.get(`${message.member.guild.id}.serverSettings.welcomeMsg.status`) ==
      'yes'
    ) {
      if (!db.get(message.member.guild.id).serverSettings.welcomeMsg.cmdUsed) {
        // Saving Default if none is present
        db.set(
          `${message.member.guild.id}.serverSettings.welcomeMsg.embedTitle`,
          'default'
        );
        db.set(
          `${message.member.guild.id}.serverSettings.welcomeMsg.topImageText`,
          'default'
        );

        db.set(
          `${message.member.guild.id}.serverSettings.welcomeMsg.bottomImageText`,
          `default`
        );
        db.set(
          `${message.member.guild.id}.serverSettings.welcomeMsg.wallpaperURL`,
          './resources/welcome/wallpaper.jpg'
        );
        db.set(
          `${message.member.guild.id}.serverSettings.welcomeMsg.imageWidth`,
          700
        );
        db.set(
          `${message.member.guild.id}.serverSettings.welcomeMsg.imageHeight`,
          250
        );
        db.set(
          `${message.member.guild.id}.serverSettings.welcomeMsg.changedByUser`,
          message.member.displayName
        );
        db.set(
          `${message.member.guild.id}.serverSettings.welcomeMsg.changedByUserURL`,
          message.member.user.displayAvatarURL({
            format: 'jpg'
          })
        );
        db.set(
          `${message.member.guild.id}.serverSettings.welcomeMsg.timeStamp`,
          message.createdAt
        );
        db.set(
          `${message.member.guild.id}.serverSettings.welcomeMsg.cmdUsed`,
          message.content
        );
        db.set(
          `${message.member.guild.id}.serverSettings.welcomeMsg.destination`,
          `direct message`
        );
      }

      // Report Back Current Settings
      const embed = new MessageEmbed()
        .setTitle(
          `:white_check_mark: Welcome Message ***Enabled*** on ${message.member.guild.name}`
        )
        .setDescription(
          'You can run the show-welcome-message Command to see what it will look like!'
        )
        .addField(
          'Command Used For Settings',
          db.get(`${message.member.guild.id}.serverSettings.welcomeMsg.cmdUsed`)
        )
        .addField(
          'Message Destination',
          db.get(
            `${message.member.guild.id}.serverSettings.welcomeMsg.destination`
          )
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
          `Image Size: `,
          db.get(
            `${message.member.guild.id}.serverSettings.welcomeMsg.imageWidth`
          ) +
            ` X ` +
            db.get(
              `${message.member.guild.id}.serverSettings.welcomeMsg.imageHeight`
            )
        )
        .addField(
          `Image Path: `,
          db.get(
            `${message.member.guild.id}.serverSettings.welcomeMsg.wallpaperURL`
          )
        )
        .setColor('#420626')
        .setFooter(
          db.get(
            `${message.member.guild.id}.serverSettings.welcomeMsg.changedByUser`
          ),
          db.get(
            `${message.member.guild.id}.serverSettings.welcomeMsg.changedByUserURL`
          )
        )
        .setTimestamp(
          db.get(
            `${message.member.guild.id}.serverSettings.welcomeMsg.timeStamp`
          )
        );
      if (
        db.get(
          `${message.member.guild.id}.serverSettings.welcomeMsg.wallpaperURL`
        ) == './resources/welcome/wallpaper.jpg'
      ) {
        const attachment = new MessageAttachment(
          '././resources/welcome/wallpaper.jpg'
        );
        embed.attachFiles(attachment);
        embed.setImage('attachment://wallpaper.jpg');
      } else
        embed.setImage(
          db.get(
            `${message.member.guild.id}.serverSettings.welcomeMsg.wallpaperURL`
          )
        );
      return message.say(embed);
    }
    // Report Settings are Disabled
    if (choice.toLowerCase() == 'no')
      message.say(
        `Welcome Message ***Disabled*** on ${message.member.guild.name}`
      );
  }
};
