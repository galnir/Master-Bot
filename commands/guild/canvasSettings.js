const { MessageEmbed, MessageAttachment } = require('discord.js');
const { Command } = require('discord.js-commando');
const db = require('quick.db');

module.exports = class WecomeSettingsCommand extends Command {
  constructor(client) {
    super(client, {
      name: 'welcome-message-settings',
      memberName: 'welcome-message-settings',
      aliases: ['welcomemessagesettings', 'welcomesettings'],
      group: 'guild',
      guildOnly: true,
      userPermissions: ['ADMINISTRATOR'],
      examples: [
        `!welcomesettings - to restore Defaults`,
        `!welcomesettings "My Title" "Upper Text" "MainText" "My Wallpaper URL" 700 250`,
        `!welcomesettings "My Title" "Upper Text" "default" "default" 800 400`,
        `!welcomesettings " "  " " "Upper Text" "My Wallpaper URL" " "  " " - to only change the Main Text and Wallpaper settings`
      ],
      description:
        'Allows you to customize the welcome message for new members that join the server.',
      args: [
        {
          key: 'embedTitle',
          prompt: 'What would you like the title to say?',
          type: 'string',
          default: `default`,
          validate: embedTitle => embedTitle.length > 0
        },
        {
          key: 'topImageText',
          prompt: 'What would you like the top text of the image to say?',
          type: 'string',
          default: `default`,
          validate: topImageText => topImageText.length > 0
        },
        {
          key: 'bottomImageText',
          prompt: 'What would you like the lower text of the image to say?',
          type: 'string',
          default: `default`,
          validate: bottomImageText => bottomImageText.length > 0
        },
        {
          key: 'wallpaperURL',
          prompt: 'What Image URL do you want to use?',
          type: 'string',
          validate: function isValidUrl(wallpaperURL) {
            try {
              new URL(wallpaperURL);
            } catch (_) {
              return false;
            }
            return true;
          },
          validate: function checkFile(file) {
            var extension = file.substr(file.lastIndexOf('.') + 1);
            if (/(jpg|jpeg|svg|png)$/gi.test(extension)) {
              return true;
            }
          },
          default: './resources/welcome/wallpaper.jpg'
        },
        {
          key: 'imageWidth',
          prompt:
            'What is the Width do you want the image to be sent? (in Pixels)',
          type: 'integer',
          default: 700
        },
        {
          key: 'imageHeight',
          prompt:
            'What is the Height do you want the image to be sent? (in Pixels)',
          type: 'integer',
          default: 250
        }
      ]
    });
  }

  run(
    message,
    {
      embedTitle,
      topImageText,
      bottomImageText,
      wallpaperURL,
      imageWidth,
      imageHeight
    }
  ) {
    if (embedTitle != ' ' || 's')
      db.set(
        `${message.member.guild.id}.serverSettings.welcomeMsg.embedTitle`,
        embedTitle
      );
    if (topImageText != ' ' || 's')
      db.set(
        `${message.member.guild.id}.serverSettings.welcomeMsg.topImageText`,
        topImageText
      );
    if (bottomImageText != ' ' || 's')
      db.set(
        `${message.member.guild.id}.serverSettings.welcomeMsg.bottomImageText`,
        bottomImageText
      );
    if (wallpaperURL != ' ' || 's') {
      db.set(
        `${message.member.guild.id}.serverSettings.welcomeMsg.wallpaperURL`,
        wallpaperURL
      );
    }
    if (imageHeight && imageWidth != ' ') {
      if (imageHeight > imageWidth) {
        //swap if in the incorrect order
        db.set(
          `${message.member.guild.id}.serverSettings.welcomeMsg.imageWidth`,
          imageHeight
        );
        db.set(
          `${message.member.guild.id}.serverSettings.welcomeMsg.imageHeight`,
          imageWidth
        );
      } else {
        db.set(
          `${message.member.guild.id}.serverSettings.welcomeMsg.imageWidth`,
          imageWidth
        );
        db.set(
          `${message.member.guild.id}.serverSettings.welcomeMsg.imageHeight`,
          imageHeight
        );
      }
    }
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
    const embed = new MessageEmbed()
      .setColor('#420626')
      .setTitle(`:white_check_mark: Welcome Settings Were saved`)
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
      .setFooter(
        db.get(
          `${message.member.guild.id}.serverSettings.welcomeMsg.changedByUser`
        ),
        db.get(
          `${message.member.guild.id}.serverSettings.welcomeMsg.changedByUserURL`
        )
      )
      .setTimestamp();
    if (wallpaperURL == './resources/welcome/wallpaper.jpg') {
      const attachment = new MessageAttachment(
        '././resources/welcome/wallpaper.jpg'
      );
      embed.attachFiles(attachment).setImage('attachment://wallpaper.jpg');
    } else
      embed.setImage(
        db.get(
          `${message.member.guild.id}.serverSettings.welcomeMsg.wallpaperURL`
        )
      );

    return message.say(embed);
  }
};
