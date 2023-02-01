import { ApplyOptions } from '@sapphire/decorators';
import {
  ApplicationCommandRegistry,
  Command,
  CommandOptions
} from '@sapphire/framework';
import type { CommandInteraction, GuildMember } from 'discord.js';

@ApplyOptions<CommandOptions>({
  name: 'activity',
  description: "Gerar um link de convite para a atividade do seu canal de voz",
  preconditions: ['GuildOnly', 'isCommandDisabled', 'inVoiceChannel']
})
export class ActivityCommand extends Command {
  public override async chatInputRun(interaction: CommandInteraction) {
    const channel = interaction.options.getChannel('channel', true);
    const activity = interaction.options.getString('activity', true);

    if (channel.type !== 'GUILD_VOICE') {
      return await interaction.reply(
        'Você só pode convidar alguém para um canal de voz!'
      );
    }

    const member = interaction.member as GuildMember;

    if (member.voice.channelId !== channel.id) {
      return await interaction.reply(
        'Você só pode convidar para o canal em que está!'
      );
    }

    let invite;
    try {
      invite = await channel.createInvite({
        reason: 'Comando de atividade gerado o convite'
      });
    } catch (err) {
      return await interaction.reply(`Alguma coisa deu errado!`);
    }

    return await interaction.reply(
      `[Click to join ${activity} in ${channel.name}](${invite.url})`
    );
  }

  public override registerApplicationCommands(
    registry: ApplicationCommandRegistry
  ): void {
    registry.registerChatInputCommand({
      name: this.name,
      description: this.description,
      options: [
        {
          type: 'CHANNEL',
          required: true,
          name: 'channel',
          description: 'Canal para o qual convidar'
        },
        {
          type: 'STRING',
          required: true,
          name: 'activity',
          description: 'Descrição da atividade'
        }
      ]
    });
  }
}
