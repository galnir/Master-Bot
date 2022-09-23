import { container } from '@sapphire/framework';
import { trpcNode } from '../../../trpc';
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
    const [type, user, key, value] = message.split('.');
    console.log(value);
    switch (type) {
      case 'reminders': {
        const discordUser = await container.client.users.fetch(user);
        const cache = await Reminders.get(`reminders.${user}.${key}`);

        const reminder: ReminderI | null = cache
          ? await JSON.parse(cache)
          : (
              await trpcNode.query('reminder.get-reminder', {
                userId: user,
                event: key
              })
            ).reminder;

        if (!reminder)
          return Logger.error('ReminderEvents: unable to retrieve reminder');

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
            reminder.timeOffset,
            reminder.repeat,
            reminder.dateTime
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
