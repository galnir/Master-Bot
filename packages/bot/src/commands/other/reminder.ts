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
import { Command, CommandOptions } from '@sapphire/framework';
import {
  ActionRowBuilder,
  ButtonBuilder,
  EmbedBuilder,
  User,
  ButtonStyle,
  ChannelType,
  ComponentType
} from 'discord.js';
import { Time } from '@sapphire/time-utilities';
import { trpcNode } from '../../trpc';
import ReminderStore from '../../lib/utils/reminders/ReminderStore';

@ApplyOptions<CommandOptions>({
  name: 'reminder',
  description: 'Definir ou Exibir Lembretes Pessoais',
  preconditions: ['timeZoneExists']
})
export class ReminderCommand extends Command {
  public override async chatInputRun(
    interaction: Command.ChatInputCommandInteraction
  ) {
    const subCommand = interaction.options.getSubcommand(true);

    if (subCommand == 'save-timezone') {
      return await askForDateTime(interaction);
    }

    if (subCommand == 'set') {
      const newEvent = interaction.options.getString('event', true);
      let timeQuery = interaction.options.getString('time', true);
      const userDB = await trpcNode.user.getUserById.query({
        id: interaction.user.id
      });

      if (!userDB.user || Number.isNaN(userDB?.user?.timeOffset)) {
        await interaction.reply({
          content:
            ':x: Algo deu errado, por favor, tente novamente depois de usar o `/reminder save-timezone` comando.',
          ephemeral: true
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
            content: `:x: Não consigo voltar no tempo`,
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
                  await interaction.user.send({
                    content: `❌ Você já tem um evento chamado **${newEvent}**`
                  });
                }
              })
              .catch(async () => {
                await interaction.editReply(
                  ':x: Não é possível enviar-lhe um DM, lembrete foi **Cancelado**.'
                );
              });
          });
        if (savedToDB) {
          await interaction.editReply('All Set');
        } else {
          await interaction.editReply(
            `:x: Reminder was **not** saved${
              interaction.channel?.type !== ChannelType.DM
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
      return await interaction.reply({
        content: await removeReminder(interaction.user.id, event, true),
        ephemeral: true
      });
    }

    if (subCommand == 'view') {
      const interactionUser = interaction.user as User;

      const cache = new ReminderStore();
      const rawKeys = await cache.getKeys(interactionUser.id);
      const keyList: string[] = [];
      if (!rawKeys.length) {
        return await interaction.reply({
          content: ":x: Você não tem nenhum lembrete.",
          ephemeral: true
        });
      }
      rawKeys.forEach(key => {
        if (!key.endsWith('trigger')) keyList.push(key);
      });
      const allReminders = await cache.getUsersReminders(keyList);
      const remindersDB = allReminders.map(reminders => JSON.parse(reminders!));

      const baseEmbed = new EmbedBuilder()
        .setColor('Purple')
        .setAuthor({
          name: `⏰ ${interactionUser.username} - Lista de lembretes`
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
        const rowOne = new ActionRowBuilder().addComponents(
          new ButtonBuilder()
            .setCustomId(`${interaction.id}-previous`)
            .setEmoji('◀️')
            .setStyle(ButtonStyle.Primary),
          new ButtonBuilder()
            .setCustomId(`${interaction.id}-next`)
            .setEmoji('▶️')
            .setStyle(ButtonStyle.Primary)
        );

        await interaction
          .reply({
            embeds: embeds[0],
            ephemeral: true,
            fetchReply: true,
            components: [
              {
                type: ComponentType.ActionRow,
                // @ts-ignore
                components: [rowOne]
              }
            ]
          })
          .then(() => {
            const collector =
              interaction.channel?.createMessageComponentCollector();
            let currentPage = 0;
            collector?.on('coletar', button => {
              if (interaction.user.id != button.user.id) return;

              if (button.customId == `${interaction.id}-anterior`) {
                currentPage = currentPage - 1 < 0 ? 0 : currentPage - 1;
                button.update({
                  embeds: embeds[currentPage]
                });
              }
              if (button.customId == `${interaction.id}-próximo`) {
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
    registry: Command.Registry
  ): void {
    registry.registerChatInputCommand(builder =>
      builder
        .setName(this.name)
        .setDescription(this.description)
        .addSubcommand(subCommand =>
          subCommand
            .setName('set')
            .setDescription('Set a reminder.')
            .addStringOption(option =>
              option
                .setName('event')
                .setDescription('What would you like to be reminded of?')
                .setRequired(true)
            )
            .addStringOption(option =>
              option
                .setName('time')
                .setDescription(
                  'Enter a Time for your Reminder. (ex: 14:30 for 2:30 pm)'
                )
                .setRequired(true)
            )
            .addStringOption(option =>
              option
                .setName('date')
                .setDescription('Enter a Date for your reminder. (MM/DD/YYYY)')
                .setRequired(false)
            )
            .addStringOption(option =>
              option
                .setName('description')
                .setDescription('Enter a Description for your reminder.')
                .setRequired(false)
            )
        )
        .addSubcommand(subCommand =>
          subCommand
            .setName('remove')
            .setDescription('Remove a reminder.')
            .addStringOption(option =>
              option
                .setName('event')
                .setDescription('What reminder would you like to remove?')
                .setRequired(true)
            )
        )
        .addSubcommand(subCommand =>
          subCommand.setName('view').setDescription('View your reminders.')
        )
        .addSubcommand(subCommand =>
          subCommand
            .setName('timezone')
            .setDescription('Set your timezone.')
            .addStringOption(option =>
              option
                .setName('timezone')
                .setDescription('Enter your timezone.')
                .setRequired(true)
            )
        )
    );
  }
}
x