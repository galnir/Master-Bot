import { ApplyOptions } from '@sapphire/decorators';
import {
  ApplicationCommandRegistry,
  Command,
  CommandOptions
} from '@sapphire/framework';
import { CommandInteraction, MessageEmbed } from 'discord.js';
import * as fs from 'fs';

@ApplyOptions<CommandOptions>({
  name: '8ball',
  description: 'Get the answer to anything!'
})
export class EightBallCommand extends Command {
  public override async chatInputRun(interaction: CommandInteraction) {
    const question = interaction.options.getString('question', true);

    if (question.length > 255) {
      return await interaction.reply('Please ask a shorter question!');
    }

    const possibleAnswers = fs.readFileSync(
      '././src/resources/other/8ball.json',
      'utf-8'
    );
    const answersArray: Array<string> = JSON.parse(possibleAnswers).answers;

    const randomAnswer =
      answersArray[Math.floor(Math.random() * answersArray.length)];

    const answerEmbed = new MessageEmbed()
      .setTitle(question)
      .setAuthor({
        name: 'Magic 8 Ball',
        iconURL: 'https://i.imgur.com/HbwMhWM.png'
      })
      .setDescription(randomAnswer)
      .setColor('#000000')
      .setTimestamp();
    return await interaction.reply({ embeds: [answerEmbed] });
  }

  public override registerApplicationCommands(
    registery: ApplicationCommandRegistry
  ): void {
    registery.registerChatInputCommand({
      name: this.name,
      description: this.description,
      options: [
        {
          type: 'STRING',
          required: true,
          name: 'question',
          description: 'What question do you want to ask the magic ball?'
        }
      ]
    });
  }
}
