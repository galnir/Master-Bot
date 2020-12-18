const { MessageEmbed, MessageAttachment } = require('discord.js');
const { Command } = require('discord.js-commando');
const db = require('quick.db');
const { prefix } = require('../../config.json');

module.exports = class WecomeSettingsCommand extends Command {
  constructor(client) {
    super(client, {
      name: 'welcome-message-settings',
      memberName: 'welcome-message-settings',
      aliases: [
        'welcomemessagesettings',
        'welcomesettings',
        'welcome-settings'
      ],
      group: 'guild',
      guildOnly: true,
      userPermissions: ['ADMINISTRATOR'],
      clientPermissions: ['MANAGE_MESSAGES', 'ATTACH_FILES', 'SEND_MESSAGES'],
      examples: [
        '```' + `${prefix}welcomesettings - to restore Defaults`,
        `${prefix}welcomesettings "Channel-name" "My Title" "Upper Text" "MainText" "My Wallpaper URL" 700 250`,
        `${prefix}welcomesettings "" "My Title" "Upper Text" "" "" 800 400`,
        `${prefix}welcomesettings "s" "s" "s" "Upper Text" "My Wallpaper URL" "700" "250" - to only change the Main Text and Wallpaper settings` +
          '```'
      ],
      description:
        'Allows you to customize the welcome message for new members that join the server.',
      args: [
        {
          key: 'destination',
          prompt: 'Where would you like the message to be sent',
          type: 'string',
          default: `direct message`
        },
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
      destination,
      embedTitle,
      topImageText,
      bottomImageText,
      wallpaperURL,
      imageWidth,
      imageHeight
    }
  ) {
    let destinationChannel;
    try {
      await message.delete();
    } catch {
      return;
    }

    const oldDB = db.get(
      `${message.member.guild.id}.serverSettings.welcomeMsg`
    );

    if (
      (destination ||
        embedTitle ||
        topImageText ||
        bottomImageText ||
        wallpaperURL ||
        imageWidth ||
        imageHeight) == 's' &&
      !oldDB
    )
      return message.reply(
        ':x: No saved values were found: Cannot use "s" this time'
      );

    if (destination == 's') destination = oldDB.destination;
    if (destination != `direct message`) {
      destinationChannel = message.guild.channels.cache.find(
        channel => channel.name == destination
      );

      if (message.guild.channels.cache.get(destination))
        destinationChannel = message.guild.channels.cache.get(destination);

      if (!destinationChannel)
        return message.reply(':x: ' + destination + ' could not be found.');
    }
    if (destination == `direct message`) destination = destination;
    else destination = destinationChannel.name;

    if (embedTitle == 's') embedTitle = oldDB.embedTitle;

    if (topImageText == 's') topImageText = oldDB.topImageText;

    if (bottomImageText == 's') bottomImageText = oldDB.bottomImageText;

    if (wallpaperURL == 's') wallpaperURL = oldDB.wallpaperURL;

    if (imageHeight && imageWidth) {
      if (imageHeight > imageWidth) {
        //swap if in the incorrect order
        imageWidth = imageHeight;

        imageHeight = imageWidth;
      }
    }

    db.set(`${message.member.guild.id}.serverSettings.welcomeMsg`, {
      destination: destination,
      embedTitle: embedTitle,
      topImageText: topImageText,
      bottomImageText: bottomImageText,
      wallpaperURL: wallpaperURL,
      imageWidth: imageWidth,
      imageHeight: imageHeight,
      changedByUser: message.member.displayName,
      changedByUserURL: message.member.user.displayAvatarURL({
        format: 'jpg'
      }),
      timeStamp: message.createdAt,
      cmdUsed: message.content
    });
    const grabDB = db.get(
      `${message.member.guild.id}.serverSettings.welcomeMsg`
    );

    const embed = new MessageEmbed()
      .setColor('#420626')
      .setTitle(`:white_check_mark: Welcome Settings Were saved`)
      .setDescription(
        'You can run the `' +
          `${prefix}show-welcome-message` +
          '` command to see what it will look like!'
      )
      .addField('Command Used For Settings', '`' + grabDB.cmdUsed + '`')
      .addField('Message Destination', grabDB.destination)
      .addField(`Title: `, grabDB.embedTitle)
      .addField(`Upper Text: `, grabDB.topImageText)
      .addField(`Lower Text: `, grabDB.bottomImageText)
      .addField(`Image Size: `, grabDB.imageWidth + ` X ` + grabDB.imageHeight)
      .addField(`Image Path: `, grabDB.wallpaperURL)
      .setFooter(grabDB.changedByUser, grabDB.changedByUserURL)
      .setTimestamp(grabDB.timeStamp);
    if (wallpaperURL == './resources/welcome/wallpaper.jpg') {
      const attachment = new MessageAttachment(
        '././resources/welcome/wallpaper.jpg'
      );
      embed.attachFiles(attachment).setImage('attachment://wallpaper.jpg');
    } else embed.setImage(grabDB.wallpaperURL);
    return message.say(embed);
  }
};
