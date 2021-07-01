const { Command } = require('discord.js-commando');
const { MessageEmbed } = require('discord.js');

module.exports = class DeleteReminderCommand extends Command {
  constructor(client) {
    super(client, {
      name: 'delete-reminder',
      aliases: [
        'unremind',
        'delete-remind',
        'remove-remind',
        'remove-reminder'
      ],
      memberName: 'delete-reminder',
      userPermissions: ['ADMINISTRATOR'],
      group: 'guild',
      description: 'Delete a timed alert',
      guildOnly: true
    });
  }

  async run(message) {
    if (!message.member.reminders) {
      message.reply('You have not set any timers!');
      return;
    }
    const selectionEmbed = new MessageEmbed()
      .setColor('#BEFF11')
      .setTitle('Choose which reminder to delete!')
      .addField('0', 'Cancel')
      .setFooter(`Choose by commenting the reminder's index`);

    for (let i = 0; i < message.member.reminders.length; i++) {
      selectionEmbed.addField(i + 1, message.member.reminders[i].text);
    }

    const selectionEmbedMessage = await message.channel.send(selectionEmbed);

    message.channel
      .awaitMessages(
        msg => ['0', '1', '2', '3', '4', '5'].includes(msg.content),
        {
          max: 1,
          time: 30000,
          errors: ['time']
        }
      )
      .then(async function onProperResponse(response) {
        if (selectionEmbedMessage)
          selectionEmbedMessage.delete().catch(console.error);
        response = response.first().content;
        const timer = message.member.reminders[response - 1].timer;
        clearTimeout(timer);
        message.reply(`Reminder number ${response} has been deleted!`);
      })
      .catch(function onResponseError() {
        if (selectionEmbedMessage)
          selectionEmbedMessage.delete().catch(console.error);
        return;
      });
  }
};
