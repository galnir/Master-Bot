import {
  askForDateTime,
  checkInputs,
  convertInputsToISO,
  isPast,
  saveReminder,
  removeReminder
} from './../../lib/utils/reminders/handleReminders';
import { PaginatedFieldMessageEmbed } from '@sapphire/discord.js-utilities';
import { ApplyOptions } from '@sapphire/decorators';
import {
  ApplicationCommandRegistry,
  Command,
  CommandOptions
} from '@sapphire/framework';
import {
  CommandInteraction,
  MessageActionRow,
  MessageButton,
  MessageEmbed,
  User
} from 'discord.js';
import { Time } from '@sapphire/time-utilities';
import { trpcNode } from '../../trpc';
import ReminderStore from '../../lib/utils/reminders/ReminderStore';

@ApplyOptions<CommandOptions>({
  name: 'reminder',
  description: 'Set or View Personal Reminders',
  preconditions: ['timeZoneExists']
})
export class ReminderCommand extends Command {
  public override async chatInputRun(interaction: CommandInteraction) {
    const subCommand = interaction.options.getSubcommand(true);

    if (subCommand == 'save-timezone') {
      return await askForDateTime(interaction);
    }

    if (subCommand == 'set') {
      const newEvent = interaction.options.getString('event', true);
      let timeQuery = interaction.options.getString('time', true);
      const userDB = await trpcNode.query('user.get-user-by-id', {
        id: interaction.user.id
      });

      if (!userDB.user || Number.isNaN(userDB?.user?.timeOffset)) {
        await interaction.reply({
          content:
            ':x: Something went wrong, Please retry after using the `/reminder save-timezone` command.'
        });
        return;
      }

      const date = interaction.options.getString('date');
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
        const isoStr = convertInputsToISO(
          userDB.user.timeOffset!,
          timeQuery,
          date!
        );

        if (isPast(isoStr)) {
          await interaction.reply({
            content: `:x: I can't go back in time`,
            ephemeral: true
          });
          return;
        }
        let savedToDB;
        await interaction
          .deferReply({
            fetchReply: true,
            ephemeral: true
          })
          .then(async () => {
            await interaction.user
              .send(
                `✅ Reminder - **${newEvent}** has been set for <t:${Math.floor(
                  new Date(isoStr).valueOf() / Time.Second
                )}> ${repeat ? ', Repeating ' + repeat : ''}`
              )
              .then(async message => {
                savedToDB = await saveReminder(interaction.user.id, {
                  userId: interaction.user.id,
                  timeOffset: userDB.user?.timeOffset!,
                  event: newEvent,
                  description: newDescription!,
                  repeat: repeat!,
                  dateTime: isoStr
                });
                if (!savedToDB) {
                  await message.delete();
                  await interaction.user.send(
                    `❌ You already have an event named **${newEvent}**`
                  );
                }
              })
              .catch(async () => {
                await interaction.editReply(
                  ':x: Unable to send you a DM, reminder has been **Canceled**.'
                );
              });
          });
        if (savedToDB) {
          await interaction.editReply('All Set');
        } else {
          await interaction.editReply(
            `:x: Reminder was **not** saved${
              interaction.channel?.type !== 'DM'
                ? `, check your DM's for more info`
                : ''
            } `
          );
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
      const interactionUser = interaction.user as User;

      const cache = new ReminderStore();
      const rawKeys = await cache.getKeys(interactionUser.id);
      const keyList: string[] = [];
      if (!rawKeys.length) {
        return await interaction.reply(":x: You don't have any reminders.");
      }
      rawKeys.forEach(key => {
        if (!key.endsWith('trigger')) keyList.push(key);
      });
      const allReminders = await cache.getUsersReminders(keyList);
      const remindersDB = allReminders.map(reminders => JSON.parse(reminders!));

      const baseEmbed = new MessageEmbed()
        .setColor('#9096e6')
        .setAuthor({
          name: `⏰ ${interactionUser.username} - Reminder List`
        })
        .setTimestamp();

      const paginatedFieldTemplate = new PaginatedFieldMessageEmbed()
        .setTitleField(`Reminders`)
        .setTemplate(baseEmbed)
        .setItems(remindersDB)
        .formatItems(
          (reminder: any) =>
            `> **${reminder.event}** --> <t:${Math.floor(
              new Date(reminder.dateTime).valueOf() / 1000
            )}>`
        )
        .setItemsPerPage(5)
        .make();

      const embeds: any[] = [];
      paginatedFieldTemplate.pages.forEach((value: any) =>
        embeds.push(value.embeds)
      ); // convert to Regular Message Embed For Ephemeral Option
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
          description: 'Set a reminder.',
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
          description: 'Show your reminders.'
        },
        {
          type: 'SUB_COMMAND',
          name: 'remove',
          description: 'Delete a reminder from you list.',
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
          description: 'Save your timezone.'
        }
      ]
    });
  }
}
