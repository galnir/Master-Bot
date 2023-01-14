import {
  CommandInteraction,
  EmbedBuilder,
  User,
  MessageActionRow,
  MessageButton
} from 'discord.js';

export class GameInvite {
  title: string;
  players: User[];
  interaction: Command.ChatInputCommandInteraction;

  public constructor(
    title: string,
    players: User[],
    interaction: Command.ChatInputCommandInteraction
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
      .setColor('YELLOW')
      .setThumbnail(thumbnail)
      .setDescription(
        `${this.interaction.user} would like to play a game of ${this.title}. Click Yes or No. if you want to join in`
      )
      .addFields({
        name: 'Players',
        value: `${this.players.length > 0 ? this.players : 'None'}`,
        inline: true
      })
      .setFooter({ text: 'Invite will expire in 60 seconds' })
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
