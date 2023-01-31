import {
  CommandInteraction,
  MessageEmbed,
  User,
  MessageActionRow,
  MessageButton
} from 'discord.js';

export class GameInvite {
  title: string;
  players: User[];
  interaction: CommandInteraction;

  public constructor(
    title: string,
    players: User[],
    interaction: CommandInteraction
  ) {
    this.title = title;
    this.players = players;
    this.interaction = interaction;
  }

  public gameInviteEmbed(): MessageEmbed {
    let thumbnail: string = '';
    switch (this.title) {
      case 'Connect 4':
        thumbnail = 'https://i.imgur.com/cUpy82Q.png';
        break;
      case 'Tic-Tac-Toe':
        thumbnail = 'https://i.imgur.com/lbPsXXN.png';
        break;

      default:
        thumbnail = this.interaction.user.displayAvatarURL({ dynamic: true });
        break;
    }

    const gameInvite = new MessageEmbed()
      .setAuthor({
        name: this.interaction.user.username,
        iconURL: this.interaction.user.avatar
          ? this.interaction.user.displayAvatarURL()
          : this.interaction.user.defaultAvatarURL
      })
      .setTitle(`${this.title} - Game Invitation`)
      .setColor('YELLOW')
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
  public gameInviteButtons(): MessageActionRow {
    const gameInviteButtons = new MessageActionRow().addComponents(
      new MessageButton()
        .setCustomId(`${this.interaction.id}${this.players.at(0)?.id}-Yes`)
        .setLabel('Yes')
        .setStyle('SUCCESS'),
      new MessageButton()
        .setCustomId(`${this.interaction.id}${this.players.at(0)?.id}-No`)
        .setLabel('No')
        .setStyle('DANGER'),
      new MessageButton()
        .setCustomId(`${this.interaction.id}${this.players.at(0)?.id}-Start`)
        .setLabel('Start')
        .setStyle('PRIMARY')
    );
    return gameInviteButtons;
  }
}
