import { ApplyOptions } from '@sapphire/decorators';
import {
  ApplicationCommandRegistry,
  Command,
  CommandOptions,
  RegisterBehavior
} from '@sapphire/framework';
import { CommandInteraction, MessageEmbed } from 'discord.js';

@ApplyOptions<CommandOptions>({
  name: 'rockpaperscissors',
  description: 'Jogue pedra, papel e tesoura comigo!',
  preconditions: ['isCommandDisabled']
})
export class RockPaperScissorsCommand extends Command {
  public override async chatInputRun(interaction: CommandInteraction) {
    const move = interaction.options.getString('move', true) as
      | 'pedra'
      | 'papel'
      | 'tesoura';
    const resultMessage = this.rpsLogic(move);

    const embed = new MessageEmbed()
      .setColor('RANDOM')
      .setTitle('Pedra, Papel, Tesoura')
      .setDescription(`**${resultMessage[0]}**, Eu formei ${resultMessage[1]}`);

    return await interaction.reply({ embeds: [embed] });
  }

  public override registerApplicationCommands(
    registry: ApplicationCommandRegistry
  ): void {
    registry.registerChatInputCommand(
      {
        name: this.name,
        description: this.description,
        options: [
          {
            name: 'move',
            type: 'STRING',
            required: true,
            description: 'Qual é o seu movimento?',
            choices: [
              { name: 'Pedra', value: 'pedra' },
              { name: 'Papel', value: 'papel' },
              { name: 'Tesoura', value: 'tesoura' }
            ]
          }
        ]
      },
      {
        behaviorWhenNotIdentical: RegisterBehavior.Overwrite
      }
    );
  }

  private rpsLogic(player_move: string) {
    const bot_move = ['pedra', 'papel', 'tesoura'][
      Math.floor(Math.random() * 3)
    ];

    if (player_move === 'pedra') {
      if (bot_move === 'pedra') {
        return ['Empate!', 'Pedra'];
      }
      if (bot_move === 'papel') {
        return ['Eu Ganhei!', 'Papel'];
      }
      return ['Você Ganhou!', 'Tesoura'];
    } else if (player_move === 'papel') {
      if (bot_move === 'pedra') {
        return ['Você ganhou!', 'Pedra'];
      }
      if (bot_move === 'papel') {
        return ['Empate!', 'Papel'];
      }
      return ['Eu Ganhei!', 'Tesoura'];
    } else {
      if (bot_move === 'pedra') {
        return ['Eu Ganhei!', 'Pedra'];
      }
      if (bot_move === 'papel') {
        return ['Você Ganhou!', 'Papel'];
      }
      return ['Empate!', 'Tesoura'];
    }
  }
}
