import {
  askForDateTime,
  checkInputs,
  convertInputsToISO,
  DBReminderInterval
} from './../../lib/utils/reminder/handleReminders';
import { PaginatedFieldMessageEmbed } from '@sapphire/discord.js-utilities';
import { ApplyOptions } from '@sapphire/decorators';
import {
  ApplicationCommandRegistry,
  Command,
  CommandOptions,
  container
} from '@sapphire/framework';
import {
  CommandInteraction,
  GuildMember,
  MessageActionRow,
  MessageButton,
  MessageEmbed
} from 'discord.js';
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
        select: {
          timeZone: true
        }
      });

      if (!userDB?.timeZone) return;
      let date = interaction.options.getString('date');
      const newDescription = interaction.options.getString('description');
      const repeat = interaction.options.getString('repeat');

      if (
        await checkInputs(
          interaction,
          newEvent,
          timeQuery,
          date!,
          newDescription!,
          repeat!
        )
      ) {
        const isoStr = convertInputsToISO(userDB.timeZone, timeQuery, date!);
        let stop = false;
        const saveToDB = await saveReminder(interaction.user.id, {
          event: newEvent,
          description: newDescription!,
          repeat: repeat!,
          dateTime: isoStr
        });
        await interaction
          .reply({
            content: 'Checking if you can receive DMs...',
            fetchReply: true
          })
          .then(async () => {
            try {
              await interaction.user.send(saveToDB);
            } catch (error) {
              await removeReminder(interaction.user.id, newEvent, false);
              stop = true;
              return await interaction.editReply(
                ':x: Unable to send you a DM, reminder has been **canceled**.'
              );
            }
            return interaction.deleteReply();
          });
        if (!stop) {
          const difference = new Date(isoStr).getTime() - Date.now();
          if (difference > 0 && difference < DBReminderInterval) {
            const remind = new RemindEmbed(
              interaction.user.id,
              userDB.timeZone,
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
                  client.reminderShortTimers[
                    `${interaction.user.id}${newEvent}`
                  ]
                );
                return;
              }, difference);
          }
        }
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

      const paginatedFieldTemplate = new PaginatedFieldMessageEmbed()
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
        .make();
      let embeds: any[] = [];
      paginatedFieldTemplate.pages.forEach((value: any) =>
        embeds.push(value.embeds)
      ); // convert to Regular Message Embed For Ephemeral Option
      console.log(paginatedFieldTemplate.pages, embeds);
      const totalPages = paginatedFieldTemplate.pages.length;
      if (totalPages > 1) {
        const rowOne = new MessageActionRow().addComponents(
          new MessageButton()
            .setCustomId(`${interaction.id}-previous`)
            .setEmoji('◀️')
            .setStyle('PRIMARY'),
          new MessageButton()
            .setCustomId(`${interaction.id}-next`)
            .setEmoji('▶️')
            .setStyle('PRIMARY'),
          new MessageButton()
            .setCustomId(`${interaction.id}-delete`)
            .setEmoji('⏹️')
            .setStyle('DANGER')
        );

        await interaction
          .reply({
            embeds: embeds[0],
            ephemeral: true,
            fetchReply: true,
            components: [rowOne]
          })
          .then(() => {
            const collector =
              interaction.channel?.createMessageComponentCollector();
            let currentPage = 0;
            collector?.on('collect', button => {
              if (interaction.user.id != button.user.id) return;

              if (button.customId == `${interaction.id}-previous`) {
                currentPage = currentPage - 1 < 0 ? 0 : currentPage - 1;
                button.update({
                  embeds: embeds[currentPage]
                });
              }
              if (button.customId == `${interaction.id}-next`) {
                currentPage =
                  currentPage + 1 > totalPages ? totalPages : currentPage + 1;
                button.update({
                  embeds: embeds[currentPage]
                });
              }
            });
          });
      } else {
        await interaction.reply({
          embeds: embeds[0],
          ephemeral: true
        });
      }
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
