import {
  EmbedLimits,
  PaginatedFieldMessageEmbed
} from '@sapphire/discord.js-utilities';
import {
  CommandInteraction,
  MessageActionRow,
  MessageEmbed,
  Modal,
  ModalActionRowComponent,
  ModalSubmitInteraction,
  TextInputComponent
} from 'discord.js';
import { Time } from '@sapphire/time-utilities';
import { trpcNode } from '../../../trpc';
import ReminderStore from './ReminderStore';
import Logger from '../logger';

export interface ReminderI {
  userId: string;
  timeOffset: number;
  event: string;
  description: string | null;
  dateTime: string;
  repeat: string | null;
}

const cache = new ReminderStore();

export async function saveReminder(userId: string, reminder: ReminderI) {
  try {
    const entry = await trpcNode.reminder.getReminder.mutate({
      userId,
      event: reminder.event
    });
    if (!entry.reminder) {
      await trpcNode.reminder.create.mutate(reminder);
      await cache.setReminder(
        userId,
        reminder.event.replace(/\./g, ''),
        JSON.stringify(reminder),
        reminder.dateTime
      );
      return true;
    }
  } catch (error) {
    Logger.error('saveReminder: ', error);
    return false;
  }
  return false;
}

export async function removeReminder(
  userId: string,
  event: string,
  sendReply: boolean
) {
  const key = `reminders.${userId}.${event.replace(/\./g, '')}`;
  const reminderExists = await cache.get(key);
  try {
    // Delete from Postgres
    await trpcNode.reminder.delete.mutate({
      userId: userId,
      event: event
    });
    // Delete from cache
    await cache.delete(`${key}.trigger`); // TTL
    await cache.delete(key); // data
  } catch (error) {
    Logger.error('removeReminder: ', error);
    if (sendReply) return ':x: Something went wrong! Please try again later.';
  }

  if (reminderExists && sendReply)
    return `:wastebasket: Deleted reminder **${event}**.`;
  else if (sendReply) return `:x: **${event}** was not found.`;

  return ':x: Something went wrong! Please try again later.';
}

export async function checkReminders() {
  try {
    const DB = await trpcNode.reminder.getAll.query();
    if (!DB.reminders || DB.reminders.length) return;
    DB.reminders.forEach(async (reminder: any) => {
      // Clean up Postgres incase trigger was missed
      if (isPast(reminder.dateTime)) {
        await removeReminder(reminder.userId, reminder.event, false);
        return;
      }
      // Store the DB entry to Cache
      await cache.setReminder(
        reminder.userId,
        reminder.event.replace(/\./g, ''),
        JSON.stringify(reminder),
        reminder.dateTime
      );
    });
  } catch (error) {
    Logger.error('checkReminders: ', error);
    return;
  }
}

export function convertInputsToISO(
  userOffset: number,
  timeQuery: string,
  date: string
) {
  let isoStr: string = '';

  const [hour, minute] = timeQuery.split(':');
  timeQuery = `${padTo2Digits(hour)}:${padTo2Digits(minute)}`;

  const localDateTime = new Date();

  const DateEntry = date ? true : false;
  if (!date) {
    date = `${
      localDateTime.getMonth() + 1
    }/${localDateTime.getDate()}/${localDateTime.getFullYear()}`;
  }
  const [month, day, year] = date.split('/') || date.split('-');
  isoStr = `${year}-${padTo2Digits(month)}-${padTo2Digits(
    day
  )}T${timeQuery}:00.000Z`;

  const timeMS = new Date(isoStr).valueOf();
  const userOffset2Ms = userOffset * Time.Minute;

  isoStr = new Date(timeMS - userOffset2Ms).toISOString();

  if (isPast(isoStr) && !DateEntry) {
    isoStr = new Date(new Date(isoStr).valueOf() + Time.Day).toISOString();
  }

  return isoStr;
}

export function isPast(dateTime: string) {
  return new Date(dateTime).valueOf() - Date.now() < 0 ? true : false;
}

async function findTimeZone(
  interaction: CommandInteraction,
  timeQuery: string,
  date: string
) {
  if (await checkInputs(interaction, 'placeholder', timeQuery, date)) {
    const [hour, minute] = timeQuery.split(':');

    timeQuery = `${padTo2Digits(hour)}:${padTo2Digits(minute)}`;

    const [month, day, year] = date.split('/') || date.split('-');
    const userTime = `${year}-${padTo2Digits(month)}-${padTo2Digits(
      day
    )}T${timeQuery}:00.000Z`;

    const userTimeMS = new Date(userTime).valueOf();
    const rawOffset = userTimeMS - new Date().valueOf();
    const offset = Math.round(rawOffset / Time.Minute / 5) * 5;

    await trpcNode.user.updateTimeOffset.mutate({
      id: interaction.user.id,
      timeOffset: offset
    });
  }
}

export function nextReminder(
  timeOffset: number,
  repeat: string,
  isoStr: string
) {
  const offset2MS = timeOffset * Time.Minute;

  if (repeat === 'Daily') {
    isoStr = new Date(
      new Date(isoStr).valueOf() + Time.Day + offset2MS
    ).toISOString();
  }

  if (repeat === 'Weekly') {
    isoStr = new Date(
      new Date(isoStr).valueOf() + Time.Day * 7 + offset2MS
    ).toISOString();
  }

  isoStr = isoStr.replace(':00.000Z', '');
  const [DBDate, DBTime] = isoStr.split('T');
  const [DBHour, DBMinute] = DBTime.split(':');
  const [DBYear, DBMonth, DBDay] = DBDate.split('-');
  let year = Number.parseInt(DBYear);
  let month = Number.parseInt(DBMonth);
  let day = Number.parseInt(DBDay);
  let hour = Number.parseInt(DBHour);
  let minute = Number.parseInt(DBMinute);

  if (repeat === 'Yearly') {
    year++;
  }

  if (repeat === 'Monthly') {
    month + 1 > 12 ? ((month = 1), year++) : month++;
  }

  return {
    date: `${padTo2Digits(month.toString())}/${padTo2Digits(
      day.toString()
    )}/${year.toString()}`,
    time: `${padTo2Digits(hour.toString())}:${padTo2Digits(
      minute.toString()
    )}:00.000Z`
  };
}

export async function checkInputs(
  interaction: CommandInteraction | ModalSubmitInteraction,
  event: string,
  time?: string,
  date?: string,
  description?: string,
  repeat?: string
) {
  let failed;
  const errors = [];
  let errorCount = 0;

  if (time) {
    const [hour, minute] = time.split(':');

    if (
      !Number.parseInt(hour) ||
      padTo2Digits(hour).length > 2 ||
      hour.indexOf(' ') >= 0
    ) {
      if (hour !== '00') {
        errorCount++;
        errors.push({
          content: `**${errorCount}**) **Invalid Hours** - Only numbers can be used to set Hours. (Example: 13:30 for 1:30 pm)`
        });
        failed = true;
      }
    }

    if (Number.parseInt(hour) > 23 || Number.parseInt(hour) < 0) {
      errorCount++;
      errors.push({
        content: `**${errorCount}**) **Invalid Hours** - Choose a number between 0 and 23. (Example: 13:30 for 1:30 pm)`
      });
      failed = true;
    }

    if (
      !Number.parseInt(minute) ||
      padTo2Digits(minute).length > 2 ||
      minute.indexOf(' ') >= 0
    ) {
      if (minute !== '00') {
        errorCount++;
        errors.push({
          content: `**${errorCount}**) **Invalid Minutes** - Only numbers can be used to set Minutes. (Example: 13:30 for 1:30 pm)`
        });
        failed = true;
      }
    }
    if (Number.parseInt(minute) > 59 || Number.parseInt(minute) < 0) {
      errorCount++;
      errors.push({
        content: `**${errorCount}**) **Invalid Minutes** - Choose a number between 0 and 59. (Example: 13:30 for 1:30 pm)`
      });
      failed = true;
    }
  }

  if (date) {
    const [month, day, year] = date.split('/') || date.split('-');

    if (
      !Number.parseInt(month) ||
      !Number.parseInt(day) ||
      !Number.parseInt(year)
    ) {
      errorCount++;
      errors.push({
        content: `**${errorCount}**) **Invalid Date** - Only numbers can be used to set the Date`
      });
      failed = true;
    }

    if (
      Number.parseInt(month) > 12 ||
      year.length !== 4 ||
      Number.parseInt(day) > 31 ||
      month.indexOf(' ') >= 0 ||
      day.indexOf(' ') >= 0 ||
      year.indexOf(' ') >= 0
    ) {
      errorCount++;
      errors.push({
        content: `**${errorCount}**) **Invalid Syntax** - Date is formatted MM/DD/YYYY`
      });
      failed = true;
    }

    if (repeat) {
      if (repeat === 'Monthly' && Number.parseInt(day) > 28) {
        errorCount++;
        errors.push({
          content: `**${errorCount}**) **Invalid Setting Combo** - Day cannot be after the 28th with "Monthly" Repeat setting enabled. (Blame February <3)`
        });
        failed = true;
      }
    }
  }
  if (event.length > EmbedLimits.MaximumTitleLength) {
    errorCount++;
    errors.push({
      content: `**${errorCount}**) **Limitation** - Event titles have a maximum length of ${EmbedLimits.MaximumTitleLength} characters`
    });

    failed = true;
  }
  if (description) {
    if (description.length > EmbedLimits.MaximumDescriptionLength) {
      errorCount++;
      errors.push({
        content: `**${errorCount}**) **Limitation** - Descriptions have a maximum length of ${EmbedLimits.MaximumDescriptionLength} characters`
      });
      failed = true;
    }
  }
  if (failed) {
    const errorEmbed = new MessageEmbed()
      .setColor('BLURPLE')
      .setAuthor({
        name: `Reminder - Error Message`,
        iconURL: interaction.user.displayAvatarURL()
      })
      .setDescription(`**There was an error processing your request!**`);
    const paginatedFieldTemplate = new PaginatedFieldMessageEmbed()
      .setTitleField(`:x: Issues`)
      .setTemplate(errorEmbed)
      .setItems(errors)
      .formatItems((item: any) => `> ${item.content}`)
      .setItemsPerPage(10)
      .make();
    const embeds = paginatedFieldTemplate.pages.values().next().value.embeds; // convert to Regular Message Embed For Ephemeral Option
    await interaction.reply({ embeds: embeds, ephemeral: true });
  }
  // inputs Passed the Error check
  return true;
}

export async function askForDateTime(interaction: CommandInteraction) {
  const modal = new Modal()
    .setCustomId('Reminder-TimeZone' + interaction.id)
    .setTitle('Reminder - Save Time Zone');
  const time = new TextInputComponent()
    .setCustomId('time' + interaction.id)
    .setLabel(`Enter your Current Time Ex. "14:30"`)
    .setPlaceholder('14:30')
    .setStyle('SHORT')
    .setRequired(true);
  const date = new TextInputComponent()
    .setCustomId('date' + interaction.id)
    .setLabel(`Enter your Current Date Ex. "MM/DD/YYYY"`)
    .setPlaceholder('12/23/2022')
    .setStyle('SHORT')
    .setRequired(true);
  const rowOne = new MessageActionRow<ModalActionRowComponent>().addComponents(
    date
  );
  const rowTwo = new MessageActionRow<ModalActionRowComponent>().addComponents(
    time
  );

  modal.addComponents(rowOne, rowTwo);
  await interaction.showModal(modal);

  const filter = (response: ModalSubmitInteraction) => {
    return response.isModalSubmit();
  };
  const submission = await interaction.awaitModalSubmit({
    filter,
    time: 5 * Time.Minute
  });

  const dateInput = submission.fields.getTextInputValue(
    'date' + interaction.id
  );
  const timeInput = submission.fields.getTextInputValue(
    'time' + interaction.id
  );
  if (await checkInputs(submission, 'placeholder', timeInput, dateInput)) {
    await findTimeZone(interaction, timeInput, dateInput);

    await submission.reply({
      content: 'Your Time Zone Offset has been saved.',
      ephemeral: true
    });
  }
}

function padTo2Digits(num: string) {
  return num.toString().padStart(2, '0');
}
