import { RemindEmbed } from './reminderEmbed';
import { container } from '@sapphire/framework';
import prisma from '../../prisma';

export const DBReminderInterval = 60000 * 10; // longer timers

export async function saveReminder(userId: string, reminder: Reminder) {
  try {
    await prisma.reminder.create({
      data: {
        event: reminder.event,
        description: reminder.description,
        dateTime: reminder.dateTime,
        user: { connect: { id: userId } }
      }
    });
  } catch (error) {
    console.log(error);
    return `:x: You already have an event named **${reminder.event}**`;
  }
  return `Reminder - **${reminder.event}** has been set for ${new Date(
    reminder.dateTime
  ).toLocaleTimeString()} on ${new Date(reminder.dateTime).toDateString()}`;
}

export async function removeReminder(
  userId: string,
  event: string,
  command: boolean
) {
  let deleted;
  try {
    deleted = await prisma.reminder.deleteMany({
      where: {
        userId: userId,
        event: event
      }
    });
  } catch (error) {
    console.error(error);
    if (command) return ':x: Something went wrong! Please try again later';
  }

  if (deleted?.count! > 0 && command)
    return `:wastebasket: Deleted reminder **${event}**.`;
  else if (command) return `:x: **${event}** was not found.`;
  return 'error'; // better than ts-ignore?
}
export async function checkReminders() {
  const reminders = await prisma.reminder.findMany({
    select: { dateTime: true, userId: true, event: true, description: true },
    orderBy: { dateTime: 'asc' }
  });
  const { client } = container;
  reminders.forEach(async reminder => {
    const difference = new Date(reminder.dateTime).getTime() - Date.now();
    // console.log(
    //   difference,
    //   difference < 30000 ?? 'Plus 0',
    //   difference > -30000 ?? 'Minus 0',
    //   `Saved ISO2MS: ${new Date(reminder.dateTime).getTime()}`,
    //   `Current Time2MS: ${Date.now()}`
    // );
    if (!client.reminderShortTimers[`${reminder.userId}${reminder.event}`]) {
      if (difference > 0 && difference < DBReminderInterval) {
        const user = client.users.cache.get(reminder.userId!);
        const remind = new RemindEmbed(
          reminder.userId,
          reminder.event,
          reminder.dateTime,
          reminder.description!
        );

        client.reminderShortTimers[`${reminder.userId}${reminder.event}`] =
          setTimeout(async () => {
            try {
              await user?.send({ embeds: [remind.RemindEmbed()] });
            } catch (error) {
              return console.log(error);
            }
            console.log(
              client.reminderShortTimers[`${reminder.userId}${reminder.event}`]
            );
            await removeReminder(reminder.userId, reminder.event, false);
            clearTimeout(
              client.reminderShortTimers[`${reminder.userId}${reminder.event}`]
            );
            return;
          }, difference);
        client.reminderShortTimers[`${reminder.userId}${reminder.event}`];
        console.log(
          client.reminderShortTimers[`${reminder.userId}${reminder.event}`]
        );
      }
    }
  });
}
checkReminders().then(() =>
  setInterval(async () => {
    await checkReminders();
  }, DBReminderInterval)
);

interface Reminder {
  event: string;
  description: string;
  dateTime: string;
}
