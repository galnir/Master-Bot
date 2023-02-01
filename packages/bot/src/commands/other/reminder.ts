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
  description: 'Definir ou Exibir Lembretes Pessoais',
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
            `:x: Lembrete **não** foi salvo${
              interaction.channel?.type !== 'DM'
                ? `, verifique sua DM's para mais informações`
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

      const baseEmbed = new MessageEmbed()
        .setColor('#9096e6')
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
        const rowOne = new MessageActionRow().addComponents(
          new MessageButton()
            .setCustomId(`${interaction.id}-previous`)
            .setEmoji('◀️')
            .setStyle('PRIMARY'),
          new MessageButton()
            .setCustomId(`${interaction.id}-next`)
            .setEmoji('▶️')
            .setStyle('PRIMARY')
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
    registry: ApplicationCommandRegistry
  ): void {
    registry.registerChatInputCommand({
      name: this.name,
      description: this.description,
      options: [
        {
          type: 'SUB_COMMAND',
          name: 'set',
          description: 'Definir um lembrete.',
          options: [
            {
              type: 'STRING',
              required: true,
              name: 'event',
              description: 'Do que você gostaria de ser lembrado?'
            },
            {
              type: 'STRING',
              required: true,
              name: 'time',
              description:
                'Insira um Tempo para o seu Lembrete. (ex: 14:30 para 02:30pm)'
            },
            {
              type: 'STRING',
              required: false,
              name: 'date',
              description: 'Insira uma Data para o seu lembrete. (MM/DD/AAAA)'
            },
            {
              type: 'STRING',
              required: false,
              name: 'description',
              description: 'Insira um lembrete de Descrição para você. (Opcional)'
            },
            {
              type: 'STRING',
              required: false,
              name: 'repeat',
              description: 'Com que frequência repetir o lembrete. (Opcional)',
              choices: [
                {
                  name: 'Anual',
                  value: 'Yearly'
                },
                {
                  name: 'Mensal',
                  value: 'Monthly'
                },
                {
                  name: 'Semanalmente',
                  value: 'Weekly'
                },
                { name: 'Diário', value: 'Daily' }
              ]
            }
          ]
        },
        {
          type: 'SUB_COMMAND',
          name: 'view',
          description: 'Mostre seus lembretes.'
        },
        {
          type: 'SUB_COMMAND',
          name: 'remove',
          description: 'Exclua um lembrete da sua lista.',
          options: [
            {
              type: 'STRING',
              required: true,
              name: 'event',
              description: 'Qual lembrete você gostaria de remover?'
            }
          ]
        },
        {
          type: 'SUB_COMMAND',
          name: 'save-timezone',
          description: 'Salve seu fuso horário.'
        }
      ]
    });
  }
}
