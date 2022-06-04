import {
  askForDateTime,
  checkInputs,
  convertTime,
  DBReminderInterval
  //   padTo2Digits
} from './../../lib/utils/reminder/handleReminders';
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
  preconditions: [
    'GuildOnly',
    'userInDB',
    'reminderNotDuplicate',
    'timeZoneExists'
  ]
})
export class ReminderCommand extends Command {
  public override async chatInputRun(interaction: CommandInteraction) {
    const subCommand = interaction.options.getSubcommand(true);
    const { client } = container;

    if (subCommand == 'save-timezone') {
      return await askForDateTime(interaction);
    }

    if (subCommand == 'set') {
      const newEvent = interaction.options.getString('event', true);
      let timeQuery = interaction.options.getString('time', true);
      const userDB = await prisma.user.findFirst({
        where: { id: interaction.user.id },
        select: { timeZone: true }
      });

      if (!userDB?.timeZone) return;
      let date = interaction.options.getString('date');
      const newDescription = interaction.options.getString('description');
      const repeat = interaction.options.getString('repeat');

      if (
        checkInputs(
          interaction,
          newEvent,
          timeQuery,
          date!,
          newDescription!,
          repeat!
        )
      ) {
        const isoStr = convertTime(userDB.timeZone, timeQuery, date!);

        const saveToDB = await saveReminder(interaction.user.id, {
          event: newEvent,
          description: newDescription!,
          timeZone: userDB.timeZone!,
          repeat: repeat!,
          dateTime: isoStr
        });

        const difference = new Date(isoStr).getTime() - Date.now();
        if (difference > 0 && difference < DBReminderInterval) {
          const remind = new RemindEmbed(
            interaction.user.id,
            newEvent,
            isoStr,
            newDescription!,
            repeat!
          );
          client.reminderShortTimers[`${interaction.user.id}${newEvent}`] =
            setTimeout(async () => {
              try {
                await interaction.user?.send({
                  embeds: [remind.RemindEmbed()]
                });
              } catch (error) {
                return console.log(error);
              }

              await removeReminder(interaction.user.id, newEvent, false);
              clearTimeout(
                client.reminderShortTimers[`${interaction.user.id}${newEvent}`]
              );
              return;
            }, difference);
        }
        if (interaction.replied)
          return await interaction
            .followUp({
              content: 'checking if you can receive DMs...',
              ephemeral: true,
              fetchReply: true
            })
            .then(async message => {
              interaction.followUp('All set see ya then');
              try {
                await interaction.user.send(saveToDB);
              } catch (error) {
                await removeReminder(interaction.user.id, newEvent, false);
                return await interaction.editReply(
                  ':x: Unable to send you a DM, reminder has been **canceled**.'
                );
              }
              return;
            });
        else
          return await interaction
            .reply({
              content: 'checking if you can receive DMs...',
              ephemeral: true,
              fetchReply: true
            })
            .then(async () => {
              await interaction.editReply('All set see ya then');
              try {
                await interaction.user.send(saveToDB).then(message => {
                  console.log(message.content);
                });
              } catch (error) {
                await removeReminder(interaction.user.id, newEvent, false);
                return await interaction.editReply(
                  ':x: Unable to send you a DM, reminder has been **canceled**!'
                );
              }
              return;
            });
      }
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
            `> **${reminder.event}** --> <t:${Math.floor(
              new Date(reminder.dateTime).valueOf() / 1000
            )}>`
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
            },
            {
              type: 'STRING',
              required: false,
              name: 'repeat',
              description: 'How often to repeat the reminder. (Optional)',
              choices: [
                {
                  name: 'Yearly',
                  value: 'Yearly'
                },
                {
                  name: 'Monthly',
                  value: 'Monthly'
                },
                {
                  name: 'Weekly',
                  value: 'Weekly'
                },
                { name: 'Daily', value: 'Daily' }
              ]
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
        },
        {
          type: 'SUB_COMMAND',
          name: 'save-timezone',
          description: 'Save your timezone'
        }
      ]
    });
  }
}
