import { ApplyOptions } from '@sapphire/decorators';
import { Command, CommandOptions } from '@sapphire/framework';
import { EmbedBuilder } from 'discord.js';
import * as fs from 'fs';

@ApplyOptions<CommandOptions>({
  name: '8ball',
  description: 'Get the answer to anything!',
  preconditions: ['isCommandDisabled']
})
export class EightBallCommand extends Command {
  public override async chatInputRun(
    interaction: Command.ChatInputCommandInteraction
  ) {
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

    const answerEmbed = new EmbedBuilder()
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
    registry: Command.Registry
  ): void {
    registry.registerChatInputCommand(builder =>
      builder
        .setName(this.name)
        .setDescription(this.description)
        .addStringOption(option =>
          option
            .setName('question')
            .setDescription('What question do you want to ask the magic ball?')
            .setRequired(true)
        )
    );
  }
}
