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

    switch (type) {
      case 'reminders': {
        if (value != 'trigger') return;
        const discordUser = await container.client.users.fetch(user);
        const cache = await Reminders.get(`reminders.${user}.${key}`);

        const reminder: ReminderI | null = cache
          ? await JSON.parse(cache)
          : (
              await trpcNode.reminder.getReminder.mutate({
                userId: user,
                event: key
              })
            ).reminder;

        if (!reminder) return;

        const remind = new RemindEmbed(
          reminder.userId,
          reminder.timeOffset,
          reminder.event,
          reminder.dateTime,
          reminder.description!,
          reminder.repeat!
        );

        await removeReminder(reminder.userId, reminder.event, false);

        try {
          await discordUser!.send({
            embeds: [remind.RemindEmbed()]
          });
        } catch (error) {
          Logger.info(
            "A Reminder message failed, the intended users DM's are likely disabled."
          );
          Logger.debug(error);
          return; // don't recreate entry if the users DMs is disabled
        }

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
      } // end of Reminder Type
    }
    return;
  });
}
