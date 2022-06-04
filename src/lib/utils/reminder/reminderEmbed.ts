import { container } from '@sapphire/framework';
import { MessageEmbed } from 'discord.js';

export class RemindEmbed {
  userId: string;
  event: string;
  dateTime: string;
  description?: string;
  repeat?: string;

  public constructor(
    userId: string,
    event: string,
    dateTime: string,
    description?: string,
    repeat?: string
  ) {
    this.userId = userId;
    this.event = event;
    this.dateTime = dateTime;
    this.description = description;
    this.repeat = repeat;
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
      .addField(
        'Alarm',
        `> <t:${Math.floor(new Date(this.dateTime).valueOf() / 1000)}>`,
        true
      )
      .setFooter({ text: 'Reminder' })
      .setTimestamp();
    if (this.repeat)
      baseEmbed.addFields([
        { name: 'Repeated', value: `> ${this.repeat}`, inline: true },
        { name: 'Next Alarm', value: '' }
      ]);
    if (this.description)
      if (this.description.length > 0)
        baseEmbed.setDescription(this.description);
    if (user)
      baseEmbed.setAuthor({
        url: user?.displayAvatarURL(),
        name: user?.username
      });
    return baseEmbed;
  }
}
