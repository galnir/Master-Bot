import { DBReminderInterval } from './../../lib/utils/reminder/handleReminders';
import { PaginatedFieldMessageEmbed } from '@sapphire/discord.js-utilities';
import { ApplyOptions } from '@sapphire/decorators';
import {
  ApplicationCommandRegistry,
  Command,
  CommandOptions,
  container
} from '@sapphire/framework';
import { CommandInteraction, GuildMember, MessageEmbed } from 'discord.js';
import {
  removeReminder,
  saveReminder
} from '../../lib/utils/reminder/handleReminders';
import prisma from '../../lib/prisma';
import { RemindEmbed } from '../../lib/utils/reminder/reminderEmbed';

@ApplyOptions<CommandOptions>({
  name: 'reminder',
  description: 'Set or View Personal Reminders',
  preconditions: ['GuildOnly', 'userInDB', 'reminderNotDuplicate']
})
export class ReminderCommand extends Command {
  public override async chatInputRun(interaction: CommandInteraction) {
    const subCommand = interaction.options.getSubcommand(true);
    const { client } = container;
    console.log(
      interaction,
      interaction.createdAt,
      new Date(interaction.createdTimestamp).toUTCString()
    );

    if (subCommand === 'set') {
      const newEvent = interaction.options.getString('event', true);
      const newDescription = interaction.options.getString('description');
      let timeQuery = interaction.options.getString('time', true);
      let date = interaction.options.getString('date');
      function padTo2Digits(num: any) {
        return num.toString().padStart(2, '0');
      }
      let [hour, minute] = timeQuery.split(':');

      if (!Number.parseInt(hour) || !Number.parseInt(minute))
        if (hour !== '00' || minute !== '00')
          return await interaction.reply(
            ':x: only numbers can be used to set the Time'
          );
      timeQuery = `${padTo2Digits(Number.parseInt(hour))}:${padTo2Digits(
        minute
      )}`;

      const currentDate = new Date(interaction.createdAt); // timezones
      let isoStr: string = currentDate.toISOString(); // placeholder
      if (!date)
        date = `${
          currentDate.getMonth() + 1
        }/${currentDate.getDate()}/${currentDate.getFullYear()}`;
      console.log(interaction);
      if (date.includes('/')) {
        const [month, day, year] = date.split('/');
        if (
          !Number.parseInt(month) ||
          !Number.parseInt(day) ||
          !Number.parseInt(year)
        )
          return await interaction.reply(
            ':x: only numbers can be used to set the Date'
          );

        if (month.length > 2 || Number.parseInt(month) > 12)
          return await interaction.reply(':x: syntax is MM/DD/YYYY');

        isoStr = `${year}-${padTo2Digits(month)}-${padTo2Digits(
          day
        )}T${timeQuery}:00.000`;
      }
      if (date.includes('-')) {
        const [month, day, year] = date.split('-');
        if (month.length > 2 || Number.parseInt(month) > 12)
          return await interaction.reply(':x: syntax is MM-DD-YYYY');
        isoStr = `${year}-${padTo2Digits(month)}-${padTo2Digits(
          day
        )}T${timeQuery}:00.000`;
      }
      const saveToDB = await saveReminder(interaction.user.id, {
        event: newEvent,
        description: newDescription!,
        dateTime: isoStr
      });

      const difference = new Date(isoStr).getTime() - Date.now();
      if (difference > 0 && difference < DBReminderInterval) {
        const remind = new RemindEmbed(
          interaction.user.id,
          newEvent,
          isoStr,
          newDescription!
        );
        client.reminderShortTimers[`${interaction.user.id}${newEvent}`] =
          setTimeout(async () => {
            try {
              await interaction.user?.send({ embeds: [remind.RemindEmbed()] });
            } catch (error) {
              return console.log(error);
            }
            console.log(
              client.reminderShortTimers[`${interaction.user.id}${newEvent}`]
            );
            await removeReminder(interaction.user.id, newEvent, false);
            clearTimeout(
              client.reminderShortTimers[`${interaction.user.id}${newEvent}`]
            );
            return;
          }, difference);
      }
      return await interaction
        .reply({
          content: 'checking if you can receive DMs...',
          ephemeral: true,
          fetchReply: true
        })
        .then(async () => {
          interaction.editReply('All set see ya then');
          try {
            await interaction.user.send(saveToDB);
          } catch (error) {
            await removeReminder(interaction.user.id, newEvent, false);
            return await interaction.editReply(
              ':x: Unable to send you a DM, reminder has been **canceled**!'
            );
          }
          return;
        });
    }
    // end of Set

    if (subCommand == 'remove') {
      const event = interaction.options.getString('event', true);
      return await interaction.reply(
        await removeReminder(interaction.user.id, event, true)
      );
    }

    if (subCommand == 'view') {
      const interactionMember = interaction.member as GuildMember;

      const reminders = await prisma.reminder.findMany({
        where: {
          userId: interactionMember.id
        },
        select: {
          event: true,
          dateTime: true,
          description: true
        },
        orderBy: {
          id: 'asc'
        }
      });
      if (!reminders.length) {
        return await interaction.reply(":x: You don't have any reminders");
      }
      const baseEmbed = new MessageEmbed().setColor('#9096e6').setAuthor({
        name: `${interactionMember.user.username}`,
        iconURL: interactionMember.user.displayAvatarURL()
      });

      new PaginatedFieldMessageEmbed()
        .setTitleField('Reminders')
        .setTemplate(baseEmbed)
        .setItems(reminders)
        .formatItems(
          (reminder: any) =>
            `**${reminder.event}** --> ${reminder.dateTime
              .replace('T', ' ')
              .replace('.000', '')}`
        )
        .setItemsPerPage(5)
        .make()
        .run(interaction);
    }
  }

  public override registerApplicationCommands(
    registry: ApplicationCommandRegistry
  ): void {
    registry.registerChatInputCommand({
      name: this.name,
      description: this.description,
      options: [
        {
          type: 'SUB_COMMAND',
          name: 'set',
          description: 'Set a reminder',
          options: [
            {
              type: 'STRING',
              required: true,
              name: 'event',
              description: 'What would you like to be reminded of?'
            },
            {
              type: 'STRING',
              required: true,
              name: 'time',
              description:
                'Enter a Time for your Reminder. (ex: 14:30 for 2:30 pm)'
            },
            {
              type: 'STRING',
              required: false,
              name: 'date',
              description: 'Enter a Date for your reminder. (MM/DD/YYYY)'
            },
            {
              type: 'STRING',
              required: false,
              name: 'description',
              description: 'Enter a Description to you reminder. (Optional)'
            }
          ]
        },
        {
          type: 'SUB_COMMAND',
          name: 'view',
          description: 'Show your reminders'
        },
        {
          type: 'SUB_COMMAND',
          name: 'remove',
          description: 'Delete a reminder from you list',
          options: [
            {
              type: 'STRING',
              required: true,
              name: 'event',
              description: 'Which reminder would you like to remove?'
            }
          ]
        }
      ]
    });
  }
}
