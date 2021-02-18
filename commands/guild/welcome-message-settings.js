const { MessageEmbed, MessageAttachment } = require('discord.js');
const { Command } = require('discord.js-commando');
const db = require('quick.db');
const { prefix } = require('../../config.json');

module.exports = class WelcomeSettingsCommand extends Command {
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
          validate: function validateEmbedTitle(embedTitle) {
            return embedTitle.length > 0 && embedTitle != ' ';
          }
        },
        {
          key: 'topImageText',
          prompt: 'What would you like the top text of the image to say?',
          type: 'string',
          default: `default`,
          validate: function validateTopImageText(topImageText) {
            return topImageText.length > 0 && topImageText != ' ';
          }
        },
        {
          key: 'bottomImageText',
          prompt: 'What would you like the lower text of the image to say?',
          type: 'string',
          default: `default`,
          validate: function validatebottomImageText(bottomImageText) {
            return bottomImageText.length > 0 && bottomImageText != ' ';
          }
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
          validateFile: function checkFile(file) {
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

  //DB Tally 2
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

    //Grab DB 1 Get
    const DBInfo = db.get(
      `${message.member.guild.id}.serverSettings.welcomeMsg`
    );

    if (
      (destination ||
        embedTitle ||
        topImageText ||
        bottomImageText ||
        wallpaperURL) == 's' &&
      !DBInfo
    ) {
      message.reply(':x: No saved values were found: Cannot use "s" this time');
      return;
    }

    if (destination == 's') destination = DBInfo.destination;
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

    if (embedTitle == 's') embedTitle = DBInfo.embedTitle;

    if (topImageText == 's') topImageText = DBInfo.topImageText;

    if (bottomImageText == 's') bottomImageText = DBInfo.bottomImageText;

    if (wallpaperURL == 's') wallpaperURL = DBInfo.wallpaperURL;

    //Swap if in the incorrect order
    if (imageHeight > imageWidth) {
      imageWidth = imageHeight;
      imageHeight = imageWidth;
    }

    //Save to DB 1 set
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

    const embed = new MessageEmbed()
      .setColor('#420626')
      .setTitle(`:white_check_mark: Welcome Settings Were saved`)
      .setDescription(
        'You can run the `' +
          `${prefix}show-welcome-message` +
          '` command to see what it will look like!'
      )
      .addField('Command Used For Settings', '`' + message.content + '`')
      .addField('Message Destination', destination)
      .addField(`Title`, embedTitle)
      .addField(`Upper Text`, topImageText)
      .addField(`Lower Text`, bottomImageText)
      .addField(`Image Size`, imageWidth + ` X ` + imageHeight)
      .addField(`Image Path`, wallpaperURL)
      .setFooter(
        message.member.displayName,
        message.member.user.displayAvatarURL()
      )
      .setTimestamp();

    //Shows Local wallpaper when in Default
    if (wallpaperURL == './resources/welcome/wallpaper.jpg') {
      const attachment = new MessageAttachment(
        '././resources/welcome/wallpaper.jpg'
      );
      embed.attachFiles(attachment).setImage('attachment://wallpaper.jpg');
    }
    //Show URL Image
    else embed.setImage(wallpaperURL);
    message.channel.send(embed);
    return;
  }
};
