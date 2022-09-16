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
    const [type, key] = message.split(':');
    // console.log(' message: ' + message);
    switch (type) {
      case 'reminder': {
        const value = await Reminders.get(key);

        // console.log(value, await Reminders.get(`${type}${key}`));
        if (!value) return Logger.error('unable to retrieve reminder');
        const reminder: ReminderI = await JSON.parse(value);
        // console.log(reminder);
        // console.log('TYPE: ', type);
        // console.log('KEY: ', key);
        // console.log('VALUE: ', value);
        const remind = new RemindEmbed(
          reminder.userId,
          reminder.timeZone,
          reminder.event,
          reminder.dateTime,
          reminder.description!,
          reminder.repeat!
        );

        try {
          const user = await container.client.users.fetch(reminder.userId);

          await user!.send({
            embeds: [remind.RemindEmbed()]
          });
        } catch (error) {
          return Logger.error(error);
        }
        await Reminders.delete(key);
        await removeReminder(reminder.userId, reminder.event, false);
        if (reminder.repeat) {
          const nextAlarm = nextReminder(reminder.repeat, reminder.dateTime);
          await saveReminder(reminder.userId, {
            userId: reminder.userId,
            timeZone: reminder.timeZone,
            event: reminder.event,
            dateTime: convertInputsToISO(
              reminder.timeZone,
              nextAlarm.time,
              nextAlarm.date
            ),
            description: reminder.description!,
            repeat: reminder.repeat
          });
        }

        break;
      }
    }
    return;
  });
}
