import {
  EmbedBuilder,
  User,
  ActionRowBuilder,
  ButtonBuilder,
  ChatInputCommandInteraction,
  Colors,
  ButtonStyle
} from 'discord.js';

export class GameInvite {
  title: string;
  players: User[];
  interaction: ChatInputCommandInteraction;

  public constructor(
    title: string,
    players: User[],
    interaction: ChatInputCommandInteraction
  ) {
    this.title = title;
    this.players = players;
    this.interaction = interaction;
  }

  public gameInviteEmbed(): EmbedBuilder {
    let thumbnail: string = '';
    switch (this.title) {
      case 'Connect 4':
        thumbnail = 'https://i.imgur.com/cUpy82Q.png';
        break;
      case 'Tic-Tac-Toe':
        thumbnail = 'https://i.imgur.com/lbPsXXN.png';
        break;

      default:
        thumbnail = this.interaction.user.displayAvatarURL();
        break;
    }

    const gameInvite = new EmbedBuilder()
      .setAuthor({
        name: this.interaction.user.username,
        iconURL: this.interaction.user.avatar
          ? this.interaction.user.displayAvatarURL()
          : this.interaction.user.defaultAvatarURL
      })
      .setTitle(`${this.title} - Game Invitation`)
      .setColor(Colors.Yellow)
      .setThumbnail(thumbnail)
      .setDescription(
        `${this.interaction.user} gostaria de jogar um jogo de ${this.title}. Clique em Sim ou Não. se você quiser participar`
      )
      .addFields({
        name: 'Players',
        value: `${this.players.length > 0 ? this.players : 'None'}`,
        inline: true
      })
      .setFooter({ text: 'O convite expirará em 60 segundos' })
      .setTimestamp();
    return gameInvite;
  }
  public gameInviteButtons(): ActionRowBuilder {
    const gameInviteButtons = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId(`${this.interaction.id}${this.players.at(0)?.id}-Yes`)
        .setLabel('Yes')
        .setStyle(ButtonStyle.Success),
      new ButtonBuilder()
        .setCustomId(`${this.interaction.id}${this.players.at(0)?.id}-No`)
        .setLabel('No')
        .setStyle(ButtonStyle.Danger),
      new ButtonBuilder()
        .setCustomId(`${this.interaction.id}${this.players.at(0)?.id}-Start`)
        .setLabel('Start')
        .setStyle(ButtonStyle.Primary)
    );
    return gameInviteButtons;
  }
}
