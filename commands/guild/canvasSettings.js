const { MessageEmbed, MessageAttachment } = require('discord.js');
const { Command } = require('discord.js-commando');
const db = require('quick.db');
const prefix = require('../../config.json');

module.exports = class WecomeSettingsCommand extends Command {
  constructor(client) {
    super(client, {
      name: 'welcome-message-settings',
      memberName: 'welcome-message-settings',
      aliases: ['welcomemessagesettings', 'welcomesettings'],
      group: 'guild',
      guildOnly: true,
      userPermissions: ['ADMINISTRATOR'],
      clientPermissions: ['MANAGE_MESSAGES', 'ATTACH_FILES', 'SEND_MESSAGES'],
      examples: [
        '```' + `${prefix}welcomesettings - to restore Defaults`,
        `${prefix}welcomesettings "My Title" "Upper Text" "MainText" "My Wallpaper URL" 700 250`,
        `${prefix}welcomesettings "My Title" "Upper Text" "" "" 800 400`,
        `${prefix}welcomesettings "s" "s" "Upper Text" "My Wallpaper URL" "700" "250" - to only change the Main Text and Wallpaper settings` +
          '```'
      ],
      description:
        'Allows you to customize the welcome message for new members that join the server.',
      args: [
        {
          key: 'embedTitle',
          prompt: 'What would you like the title to say?',
          type: 'string',
          default: `default`,
          validate: embedTitle => embedTitle.length > 0 && embedTitle != ' '
        },
        {
          key: 'topImageText',
          prompt: 'What would you like the top text of the image to say?',
          type: 'string',
          default: `default`,
          validate: topImageText =>
            topImageText.length > 0 && topImageText != ' '
        },
        {
          key: 'bottomImageText',
          prompt: 'What would you like the lower text of the image to say?',
          type: 'string',
          default: `default`,
          validate: bottomImageText =>
            bottomImageText.length > 0 && bottomImageText != ' '
        },
        {
          key: 'wallpaperURL',
          prompt: 'What Image URL do you want to use?',
          type: 'string',
          validate: function isValidUrl(wallpaperURL) {
            if (wallpaperURL == 's') {
              return true;
            } else {
              try {
                new URL(wallpaperURL);
              } catch (_) {
                return false;
              }
              return true;
            }
          },
          validate: function checkFile(file) {
            if (file == 's') return true;
            else {
              var extension = file.substr(file.lastIndexOf('.') + 1);
              if (/(jpg|jpeg|svg|png)$/gi.test(extension)) {
                return true;
              }
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

  async run(
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
    try {
      await message.delete();
    } catch {
      return;
    }
    if (embedTitle == 's')
      embedTitle = db.get(
        `${message.member.guild.id}.serverSettings.welcomeMsg.embedTitle`
      );

    db.set(
      `${message.member.guild.id}.serverSettings.welcomeMsg.embedTitle`,
      embedTitle
    );

    if (topImageText == 's')
      topImageText = db.get(
        `${message.member.guild.id}.serverSettings.welcomeMsg.topImageText`
      );

    db.set(
      `${message.member.guild.id}.serverSettings.welcomeMsg.topImageText`,
      topImageText
    );

    if (bottomImageText == 's')
      bottomImageText = db.get(
        `${message.member.guild.id}.serverSettings.welcomeMsg.bottomImageText`
      );

    db.set(
      `${message.member.guild.id}.serverSettings.welcomeMsg.bottomImageText`,
      bottomImageText
    );
    if (wallpaperURL == 's')
      wallpaperURL = db.get(
        `${message.member.guild.id}.serverSettings.welcomeMsg.wallpaperURL`
      );

    db.set(
      `${message.member.guild.id}.serverSettings.welcomeMsg.wallpaperURL`,
      wallpaperURL
    );

    if (imageHeight && imageWidth) {
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
    db.set(
      `${message.member.guild.id}.serverSettings.welcomeMsg.timeStamp`,
      message.createdAt
    );
    db.set(
      `${message.member.guild.id}.serverSettings.welcomeMsg.cmdUsed`,
      message.content
    );

    const embed = new MessageEmbed()
      .setColor('#420626')
      .setTitle(`:white_check_mark: Welcome Settings Were saved`)
      .setDescription(
        'You can run the Join Command to see what it will look like!'
      )
      .addField(
        'Command Used For Settings',
        db.get(`${message.member.guild.id}.serverSettings.welcomeMsg.cmdUsed`)
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
      .setTimestamp(
        db.get(`${message.member.guild.id}.serverSettings.welcomeMsg.timeStamp`)
      );
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
