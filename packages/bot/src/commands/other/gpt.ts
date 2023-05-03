import { ApplyOptions } from '@sapphire/decorators';
import { Command, CommandOptions } from '@sapphire/framework';
require('dotenv/config');
const { Configuration, OpenAIApi } = require('openai');

@ApplyOptions<CommandOptions>({
  name: 'gpt',
  description: 'Talk to me!',
  preconditions: ['isCommandDisabled']
})
export class GptCommand extends Command {
  public override async chatInputRun(
    interaction: Command.ChatInputCommandInteraction
  ) {
    const userMessage = interaction.options.getString('message', true);
    await interaction.deferReply();
    if (!process.env.OPEN_API!)
      return interaction.editReply({ content: 'This command is unavailable.' });
    const configuration = new Configuration({
      apiKey: process.env.OPEN_API
    });

    const openai = new OpenAIApi(configuration);

    const conversationLog = [
      { role: 'system', content: "You're a funny chatbot!" }
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

    const maxLength = 2000; // Sets the maximum character limit
    const responseLength = response.length;

    if (responseLength > maxLength) {
      const numChunks = Math.ceil(responseLength / maxLength); // Calculates the number of parts the response will be split into
      const chunks = []; // Stores the parts of the response
      for (let i = 0; i < numChunks; i++) {
        const start = i * maxLength;
        const end = (i + 1) * maxLength;

        chunks.push(response.substring(start, end)); // Adds the current part to the list of parts
      }
      let index = 0;
      for (const chunk of chunks) {
        if (index === 0) {
          await interaction.editReply({ content: chunk }); // Edit the deferred reply with the first chunk
        } else {
          await interaction.channel?.send({ content: chunk }); // Sends each part separately
        }
        index++;
      }
      return;
    } else {
      const finalResponse = response.endsWith('\n')
        ? response
        : response + '\n'; // Ensures the message ends with a newline to avoid cutting a word in half
      return interaction.editReply({ content: finalResponse }); // Sends the complete response
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
            .setName('message')
            .setDescription('The message to send to the GPT')
            .setRequired(true)
        )
    );
  }
}