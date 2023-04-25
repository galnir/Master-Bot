import { ApplyOptions } from '@sapphire/decorators';
import { Command, CommandOptions } from '@sapphire/framework';
import { GuildMember } from 'discord.js';

@ApplyOptions<CommandOptions>({
  name: 'activity',
  description: "Gerar um link de convite para a atividade do seu canal de voz",
  preconditions: ['GuildOnly', 'isCommandDisabled', 'inVoiceChannel']
})
export class ActivityCommand extends Command {
  public override async chatInputRun(
    interaction: Command.ChatInputCommandInteraction
  ) {
    const channel: any = interaction.options.getChannel('channel', true);
    const activity = interaction.options.getString('activity', true);

    if (channel.type.toString() !== 'GUILD_VOICE') {
      return await interaction.reply(
        'Você só pode convidar alguém para um canal de voz!'
      );
    }

    const member = interaction.member as GuildMember;

    if (!member) {
      return await interaction.reply('Something went wrong!');
    }

    if (member.voice.channelId !== channel.id) {
      return await interaction.reply(
        'Você só pode convidar para o canal em que está!'
      );
    }

    if (channel.type.toString() == 'GUILD_CATEGORY') {
      return await interaction.reply('You can only invite to valid channel!');
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
    registry: Command.Registry
  ): void {
    registry.registerChatInputCommand(builder =>
      builder
        .setName(this.name)
        .setDescription(this.description)
        .addChannelOption(option =>
          option
            .setName('channel')
            .setDescription('Channel to invite to')
            .setRequired(true)
        )
        .addStringOption(option =>
          option
            .setName('activity')
            .setDescription('Activity description')
            .setRequired(true)
        )
    );
  }
}
