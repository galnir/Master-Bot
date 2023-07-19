import {
  PaginatedMessage,
  PaginatedFieldMessageEmbed
} from '@sapphire/discord.js-utilities';
import { ApplyOptions } from '@sapphire/decorators';
import { Command, CommandOptions, container } from '@sapphire/framework';
import {
  ApplicationCommandOption,
  AutocompleteInteraction,
  EmbedBuilder
} from 'discord.js';

@ApplyOptions<CommandOptions>({
  name: 'help',
  description: 'Get the Command List or add a command-name to get more info.',
  preconditions: ['isCommandDisabled']
})
export class HelpCommand extends Command {
  public override autocompleteRun(interaction: AutocompleteInteraction) {
    const commands = interaction.client.application?.commands.cache;
    const focusedOption = interaction.options.getFocused(true);
    const result = commands
      ?.sorted((a, b) => a.name.localeCompare(b.name))
      .filter(choice => choice.name.startsWith(focusedOption.value.toString()))
      .map(choice => ({ name: choice.name, value: choice.name }))
      .slice(0, 10);
    interaction;
    return interaction.respond(result!);
  }
  public override async chatInputRun(
    interaction: Command.ChatInputCommandInteraction
  ) {
    const { client } = container;

    const query = interaction.options.getString('command-name')?.toLowerCase();
    const array: CommandInfo[] = [];

    const app = client.application;
    app?.commands.cache.each(command => {
      array.push({
        name: command.name,
        options: command.options,
        details: command.description
      });
    });

    const sortedList = array.sort((a, b) => {
      let fa = a.name.toLowerCase(),
        fb = b.name.toLowerCase();

      if (fa < fb) {
        return -1;
      }
      if (fa > fb) {
        return 1;
      }
      return 0;
    });

    if (!query) {
      let characters = 0;
      let page = 0;
      let message: string[] = [];
      const PaginatedEmbed = new PaginatedMessage();
      sortedList.forEach((command, index) => {
        characters += command.details.length + command.details.length;
        message.push(`> **/${command.name}** - ${command.details}\n`);

        if (characters > 1500 || index == sortedList.length - 1) {
          page++;
          characters = 0;
          PaginatedEmbed.addPageEmbed(
            new EmbedBuilder()
              .setTitle(`Command List - Page ${page}`)
              .setThumbnail(app?.iconURL()!)
              .setColor('Purple')
              .setAuthor({
                name: interaction.user.username + ' - Help Command',
                iconURL: interaction.user.displayAvatarURL()
              })
              .setDescription(message.toString().replaceAll(',> **/', '> **/'))
          );
          message = [];
        }
      });

      return PaginatedEmbed.run(interaction);
    } else {
      const commandMap = new Map();
      sortedList.reduce(
        (obj, command) => commandMap.set(command.name, command),
        {}
      );
      if (commandMap.has(query)) {
        const command: CommandInfo = commandMap.get(query);
        const optionsList: any[] = [];
        command.options.forEach(option => {
          optionsList.push({
            name: option.name,
            description: option.description
          });
        });
        const DetailedPagination = new PaginatedFieldMessageEmbed();

        const commandDetails = new EmbedBuilder()
          .setAuthor({
            name: interaction.user.username + ' - Help Command',
            iconURL: interaction.user.displayAvatarURL()
          })
          .setThumbnail(app?.iconURL()!)
          .setTitle(
            `${
              command.name.charAt(0).toUpperCase() +
              command.name.slice(1).toLowerCase()
            } - Details`
          )
          .setColor('Purple')
          .setDescription(`**Description**\n> ${command.details}`);

        if (!command.options.length)
          return await interaction.reply({ embeds: [commandDetails] });

        DetailedPagination.setTemplate(commandDetails)
          .setTitleField('Options')
          .setItems(command.options)
          .formatItems(
            (option: any) => `**${option.name}**\n> ${option.description}`
          )
          .setItemsPerPage(5)
          .make();

        return DetailedPagination.run(interaction);
      } else
        return await interaction.reply(
          `:x: Command: **${query}** was not found`
        );
    }
    interface CommandInfo {
      name: string;
      options: ApplicationCommandOption[];
      details: string;
    }
  }

  public override registerApplicationCommands(
    registry: Command.Registry
  ): void {
    registry.registerChatInputCommand(builder =>
      builder
        .setName(this.name)
        .setDescription(this.description)
        .addStringOption(option =>
          option
            .setName('command-name')
            .setDescription('Which command would you like to know about?')
            .setRequired(false)
        )
    );
  }
}
