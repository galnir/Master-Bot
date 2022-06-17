import { container } from '@sapphire/framework';
import { MessageEmbed } from 'discord.js';
import { convertInputsToISO, nextReminder } from './handleReminders';

export class RemindEmbed {
  userId: string;
  timeZone: number;
  event: string;
  dateTime: string;
  description?: string;
  repeat?: string;

  public constructor(
    userId: string,
    timeZone: number,
    event: string,
    dateTime: string,
    description?: string,
    repeat?: string
  ) {
    this.userId = userId;
    this.timeZone = timeZone;
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
        `⏰ Reminder - ${
          this.event.charAt(0).toUpperCase() + this.event.slice(1).toLowerCase()
        }`
      )
      .setFooter({
        iconURL: user?.displayAvatarURL(),
        text: user?.username!
      })
      .setTimestamp();

    if (this.repeat) {
      const nextAlarm = nextReminder(this.repeat!, this.dateTime);
      baseEmbed.addFields([
        {
          name: 'Next Alarm',
          value: `> <t:${Math.floor(
            new Date(
              convertInputsToISO(this.timeZone, nextAlarm.time, nextAlarm.date)
            ).valueOf() / 1000
          )}>`,
          inline: true
        },
        { name: 'Repeated', value: `> ${this.repeat}`, inline: true }
      ]);
    }
    if (this.description)
      if (this.description.length > 0)
        baseEmbed.setDescription(`> ${this.description}`);
    return baseEmbed;
  }
}
