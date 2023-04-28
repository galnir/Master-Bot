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

    console.log(`PERGUNTA: ${userMessage}`);
    console.log(`RESPOSTA: ${response}`);


    const maxLength = 2000; // Define o limite máximo de caracteres
    const responseLength = response.length;

    if (responseLength > maxLength) {
      const numChunks = Math.ceil(responseLength / maxLength); // Calcula o número de partes em que a resposta será dividida
      const chunks = []; // Armazena as partes da resposta
      for (let i = 0; i < numChunks; i++) {
        const start = i * maxLength;
        const end = (i + 1) * maxLength;

        chunks.push(response.substring(start, end)); // Adiciona a parte atual à lista de partes
      }

      for (const chunk of chunks) {
         await interaction.channel?.send({ content: chunk }); // Envia cada parte separadamente
      }
    } else {
      const finalResponse = response.endsWith('\n') ? response : response + '\n'; // Garante que a mensagem termina com uma nova linha para evitar cortar uma palavra ao meio
       await interaction.channel?.send({ content: finalResponse }); // Envia a resposta completa
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