import { ApplyOptions } from '@sapphire/decorators';
import { Command, CommandOptions } from '@sapphire/framework';
require('dotenv/config');
const { Configuration, OpenAIApi } = require('openai');

@ApplyOptions<CommandOptions>({
  name: 'gpt',
  description: 'Talk To Me!!!',
  preconditions: ['isCommandDisabled']
})
export class GptCommand extends Command {
  public override async chatInputRun(
    interaction: Command.ChatInputCommandInteraction
  ) {
    if (!process.env.OPEN_API)
      return interaction.reply('this command has been disabled');
    const userMessage = interaction.options.getString('message', true);
    if (!userMessage) {
      return interaction.reply({
        content: 'Please, input a message',
        ephemeral: true
      });
    }
    await interaction.deferReply();
    const configuration = new Configuration({
      apiKey: process.env.OPEN_API
    });

    const openai = new OpenAIApi(configuration);

    const conversationLog = [
      { role: 'system', content: 'You are a funny chatbot!' }
    ];

    conversationLog.push({
      role: 'user',
      content: userMessage
    });

    const result = await openai.createChatCompletion({
      model: 'gpt-3.5-turbo',
      messages: conversationLog,
      temperature: 1,
      n: 1
    });
    const response = result.data.choices[0].message.content;
    if (response) {
      return await interaction.editReply({
        content: response
      });
    } else {
      return await interaction.editReply({
        content: 'Unable to get a response from GPT.'
      });
    }
  }

  public override registerApplicationCommands(
    registry: Command.Registry
  ): void {
    if (process.env.OPEN_API!) {
      registry.registerChatInputCommand(builder =>
        builder
          .setName(this.name)
          .setDescription(this.description)
          .addStringOption(option =>
            option
              .setName('message')
              .setDescription('Please, input a message')
              .setRequired(true)
          )
      );
    }
  }
}
