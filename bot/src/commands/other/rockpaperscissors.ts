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
  description: 'Play rock paper scissors with me!'
})
export class RockPaperScissorsCommand extends Command {
  public override async chatInputRun(interaction: CommandInteraction) {
    const move = interaction.options.getString('move', true) as
      | 'rock'
      | 'paper'
      | 'scissors';
    const resultMessage = this.rpsLogic(move);

    const embed = new MessageEmbed()
      .setColor('RANDOM')
      .setTitle('Rock, Paper, Scissors')
      .setDescription(`**${resultMessage[0]}**, I formed ${resultMessage[1]}`);

    return await interaction.reply({ embeds: [embed] });
  }

  public override registerApplicationCommands(
    registery: ApplicationCommandRegistry
  ): void {
    registery.registerChatInputCommand(
      {
        name: this.name,
        description: this.description,
        options: [
          {
            name: 'move',
            type: 'STRING',
            required: true,
            description: 'What is your move?',
            choices: [
              { name: 'Rock', value: 'rock' },
              { name: 'Paper', value: 'paper' },
              { name: 'Scissors', value: 'scissors' }
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
    const bot_move = ['rock', 'paper', 'scissors'][
      Math.floor(Math.random() * 3)
    ];

    if (player_move === 'rock') {
      if (bot_move === 'rock') {
        return ['Tie!', 'Rock'];
      }
      if (bot_move === 'paper') {
        return ['I win!', 'Paper'];
      }
      return ['You win!', 'Scissors'];
    } else if (player_move === 'paper') {
      if (bot_move === 'rock') {
        return ['You win!', 'Rock'];
      }
      if (bot_move === 'paper') {
        return ['Tie!', 'Paper'];
      }
      return ['I win!', 'Scissors'];
    } else {
      if (bot_move === 'rock') {
        return ['I win!', 'Rock'];
      }
      if (bot_move === 'paper') {
        return ['You win!', 'Paper'];
      }
      return ['Tie!', 'Scissors'];
    }
  }
}
