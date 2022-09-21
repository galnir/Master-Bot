import { container } from '@sapphire/framework';
import Logger from '../logger';
import {
  convertInputsToISO,
  nextReminder,
  ReminderI,
  removeReminder,
  saveReminder
} from './handleReminders';
import { RemindEmbed } from './reminderEmbed';
import PubSub from './RemindersPubSub';
import ReminderStore from './ReminderStore';

const Reminders = new ReminderStore();

export default function ReminderEvents() {
  PubSub.subscribe(`__keyevent@${process.env.REDIS_DB || 0}__:expired`);
  PubSub.on('message', async (channel: string, message: string) => {
    const [user, type, key] = message.split(':');

    switch (type) {
      case 'reminders': {
        const value = await Reminders.get(`${user}:reminders:${key}`);
        const discordUser = await container.client.users.fetch(user);

        if (!value)
          return Logger.error('ReminderEvents', 'unable to retrieve reminder');
        const reminder: ReminderI = await JSON.parse(value);

        const remind = new RemindEmbed(
          reminder.userId,
          reminder.timeOffset,
          reminder.event,
          reminder.dateTime,
          reminder.description!,
          reminder.repeat!
        );

        try {
          await discordUser!.send({
            embeds: [remind.RemindEmbed()]
          });
        } catch (error) {
          return Logger.error(error);
        }
        await removeReminder(reminder.userId, reminder.event, false);
        if (reminder.repeat) {
          const nextAlarm = nextReminder(
            reminder.repeat,
            reminder.dateTime,
            reminder.timeOffset
          );
          await saveReminder(reminder.userId, {
            userId: reminder.userId,
            timeOffset: reminder.timeOffset,
            event: reminder.event,
            dateTime: convertInputsToISO(
              reminder.timeOffset,
              nextAlarm.time,
              nextAlarm.date
            ),
            description: reminder.description,
            repeat: reminder.repeat
          });
        }
        break;
      }
    }
    return;
  });
}
