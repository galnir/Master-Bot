import { container } from '@sapphire/framework';
import { MessageEmbed } from 'discord.js';

export class RemindEmbed {
  userId: string;
  event: string;
  dateTime: string;
  description?: string;

  public constructor(
    userId: string,
    event: string,
    dateTime: string,
    description: string
  ) {
    this.userId = userId;
    this.event = event;
    this.dateTime = dateTime;
    this.description = description;
  }
  public RemindEmbed() {
    const { client } = container;
    const user = client.users.cache.get(this.userId);
    const baseEmbed = new MessageEmbed()

      .setColor('YELLOW')
      .setTitle(
        `:alarm_clock: Reminder - ${
          this.event.charAt(0).toUpperCase() + this.event.slice(1).toLowerCase()
        }`
      )
      .addField('Alarm', this.dateTime.replace('.000', '').replace('T', ' '))
      .setFooter({ text: 'Reminder' })
      .setTimestamp();
    if (this.description && this.description.length > 0)
      baseEmbed.setDescription(this.description);
    if (user)
      baseEmbed.setAuthor({
        url: user?.displayAvatarURL(),
        name: user?.username
      });
    return baseEmbed;
  }
}
