import { ApplyOptions } from '@sapphire/decorators';
import { Command, CommandOptions } from '@sapphire/framework';
require('dotenv/config');
const { Configuration, OpenAIApi } = require('openai');


@ApplyOptions<CommandOptions>({
  name: 'gpt',
  description: 'Converse comigo!',
  preconditions: ['isCommandDisabled']
})
export class GptCommand extends Command {
    
  public override async chatInputRun(
    interaction: Command.ChatInputCommandInteraction
  ) {
    
    const userMessage = interaction.options.getString('mensagem', true);
    if (!userMessage) {
      return interaction.reply(
        {
        content:'Por favor, forneça uma mensagem para o GPT', 
        ephemeral: true 
      });
    }

    const configuration = new Configuration({
        apiKey: process.env.OPEN_API,
    })  

    const openai = new OpenAIApi(configuration);

    const conversationLog  = [{ role: 'system', content: "Você é um chatbot engraçado!"}];
        
    conversationLog.push({
        role: 'user',
        content: userMessage,
    });

    const result = await openai.createChatCompletion({
        model: 'gpt-3.5-turbo',
        messages: conversationLog,
        temperature: 1,
        n: 1
    })
    const response = result.data.choices[0].message.content;
    console.log(response);
    if (response) {
        return await interaction.channel?.send({
        content:response
      });
    }
    else {
       return await interaction.channel?.send({
        content:'Não foi possível obter uma resposta do GPT.',
      });
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
            .setName('mensagem')
            .setDescription('A mensagem para enviar ao GPT')
            .setRequired(true) 
        )
    );
  }
}