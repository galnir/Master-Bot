const { MessageEmbed } = require('discord.js');
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
      clientPermissions: ['ADMINISTRATOR'],
      examples: [
        `!welcomesettings - to restore Defaults`,
        `!welcomesettings "My Title" "Upper Text" "MainText" "My Wallpaper URL" 700 250`,
        `!welcomesettings "My Title" "Upper Text" "default" "default" 800 400`,
        `!welcomesettings "default" "Upper Text" "MainText" "My Wallpaper URL"`
      ],
      description:
        'Allows you to customize the welcome message for new members that join the server.',
      args: [
        {
          key: 'embedTitle',
          prompt: 'What would you like the title to say?',
          type: 'string',
          default: `default`
        },
        {
          key: 'topImageText',
          prompt: 'What would you like the top text of the image to say?',
          type: 'string',
          default: `default`
        },
        {
          key: 'bottomImageText',
          prompt: 'What would you like the lower text of the image to say?',
          type: 'string',
          default: `default`
        },
        {
          key: 'wallpaperURL',
          prompt: 'What Image URL do you want to use?',
          type: 'string',
          default: 'default'
        },
        {
          key: 'imageWidth',
          prompt:
            'What is the Width do you want the image to be sent? (in Pixels)',
          type: 'integer',
          default: 700,
          min: 300
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
    //embedTitle
    //saving
    db.set(
      `${message.member.guild.id}.serverSettings.welcomeMsg.embedTitle`,
      embedTitle
    );
    //topImageText
    //saving
    db.set(
      `${message.member.guild.id}.serverSettings.welcomeMsg.topImageText`,
      topImageText
    );
    //bottomImageText
    //saving
    db.set(
      `${message.member.guild.id}.serverSettings.welcomeMsg.bottomImageText`,
      bottomImageText
    );
    //wallpaperURL
    //saving

    if (wallpaperURL == 'default')
      db.set(
        `${message.member.guild.id}.serverSettings.welcomeMsg.wallpaperURL`,
        './resources/welcome/wallpaper.jpg'
      );
    // else {
    //   if (
    //     wallpaperURL.has(/.jpg/g) ||
    //     wallpaperURL.has(/.jpeg/g) ||
    //     wallpaperURL.has(/.png/g) ||
    //     wallpaperURL.has(/.svg/g)
    //   )
    db.set(
      `${message.member.guild.id}.serverSettings.welcomeMsg.wallpaperURL`,
      wallpaperURL
    );
    // }

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
      //imageWidth
      //saving
      db.set(
        `${message.member.guild.id}.serverSettings.welcomeMsg.imageWidth`,
        imageWidth
      );
      //imageHeight
      //saving
      db.set(
        `${message.member.guild.id}.serverSettings.welcomeMsg.imageHeight`,
        imageHeight
      );
    }
    const embed = new MessageEmbed()
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
};
