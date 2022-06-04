import { RemindEmbed } from './reminderEmbed';
import { container } from '@sapphire/framework';
import prisma from '../../prisma';
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

export const DBReminderInterval = 60000 * 10; // longer timers

export async function saveReminder(userId: string, reminder: Reminder) {
  try {
    await prisma.reminder.create({
      data: {
        event: reminder.event,
        description: reminder.description,
        dateTime: reminder.dateTime,
        repeat: reminder.repeat,
        user: { connect: { id: userId } }
      }
    });
  } catch (error) {
    console.log(error);
    return `:x: You already have an event named **${reminder.event}**`;
  }

  return `Reminder - **${reminder.event}** has been set for <t:${Math.floor(
    new Date(reminder.dateTime).valueOf() / 1000
  )}>`;
}
export function convertTime(
  timeZoneOffset: number | null,
  timeQuery: string,
  date: string
) {
  const operator = timeZoneOffset! > 0 ? '+' : '-';

  let [hour, minute] = timeQuery.split(':');
  const currentDate = new Date(Date.now());
  timeQuery = `${padTo2Digits(hour)}:${padTo2Digits(minute)}`;

  let isoStr: string = currentDate.toISOString();

  const localOffset = currentDate.getTimezoneOffset() * 60000;
  let subtractTime = false;
  if (currentDate.getTimezoneOffset() < 0) subtractTime = true;

  if (!date)
    date = `${
      currentDate.getMonth() + 1
    }/${currentDate.getDate()}/${currentDate.getFullYear()}`;
  const [month, day, year] = date.split('/') || date.split('-');
  isoStr = `${year}-${padTo2Digits(month)}-${padTo2Digits(
    day
  )}T${timeQuery}:00.000Z`;
  const timeMS = new Date(isoStr).valueOf();
  const minToMS = timeZoneOffset! * 60000;
  const totalOffset = localOffset - (subtractTime ? -minToMS : +minToMS);

  isoStr = new Date(
    operator == '+' ? timeMS + totalOffset : timeMS - totalOffset
  )
    .toISOString()
    .replace('Z', '');
  return isoStr;
}

export async function findTimeZone(
  interaction: CommandInteraction,
  timeQuery: string,
  date: string
) {
  if (checkInputs(interaction, 'placeholder', timeQuery, date)) {
    const currentDate = new Date(Date.now()); // timezones
    let [hour, minute] = timeQuery.split(':');

    timeQuery = `${padTo2Digits(hour)}:${padTo2Digits(minute)}`;

    let userTime: string = currentDate.toISOString();

    const [month, day, year] = date.split('/') || date.split('-');
    userTime = `${year}-${padTo2Digits(month)}-${padTo2Digits(
      day
    )}T${timeQuery}:00.000Z`;
    const userTimeMS = new Date(userTime).valueOf();
    const totalOffset = currentDate.getTime() - userTimeMS;

    await prisma.user.update({
      data: { timeZone: Math.floor(totalOffset / 60000) },
      select: { timeZone: true },
      where: { id: interaction.user.id }
    });
  }
}
export async function removeReminder(
  userId: string,
  event: string,
  isCommand: boolean
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
    if (isCommand) return ':x: Something went wrong! Please try again later';
  }

  if (deleted?.count! > 0 && isCommand)
    return `:wastebasket: Deleted reminder **${event}**.`;
  else if (isCommand) return `:x: **${event}** was not found.`;

  return ':x: Something went wrong! Please try again later';
}
export async function checkReminders() {
  const reminders = await prisma.reminder.findMany({
    select: {
      dateTime: true,
      userId: true,
      event: true,
      description: true,
      repeat: true
    },
    orderBy: { dateTime: 'asc' }
  });
  const { client } = container;
  reminders.forEach(async reminder => {
    const difference = new Date(reminder.dateTime).getTime() - Date.now();
    if (!client.reminderShortTimers[`${reminder.userId}${reminder.event}`]) {
      if (difference > 0 && difference < DBReminderInterval) {
        const user = client.users.cache.get(reminder.userId!);
        const remind = new RemindEmbed(
          reminder.userId,
          reminder.event,
          reminder.dateTime,
          reminder.description!,
          reminder.repeat!
        );

        client.reminderShortTimers[`${reminder.userId}${reminder.event}`] =
          setTimeout(async () => {
            try {
              await user?.send({ embeds: [remind.RemindEmbed()] });
            } catch (error) {
              return console.log(error);
            }
            if (!reminder.repeat) {
              await removeReminder(reminder.userId, reminder.event, false);
            }

            clearTimeout(
              client.reminderShortTimers[`${reminder.userId}${reminder.event}`]
            );
            return;
          }, difference);
        client.reminderShortTimers[`${reminder.userId}${reminder.event}`];
      }
    }
  });
}
checkReminders().then(() =>
  setInterval(async () => {
    await checkReminders();
  }, DBReminderInterval)
);

export function nextReminder(repeat: string, isoStr: string) {}

export function checkInputs(
  interaction: CommandInteraction | ModalSubmitInteraction,
  event: string,
  time?: string,
  date?: string,
  description?: string,
  repeat?: string
) {
  let Passed = true;
  const errors = [];
  let errorCount = 0;

  if (time) {
    let [hour, minute] = time.split(':');

    if (!Number.parseInt(hour) || hour.length > 2) {
      if (hour != '00') {
        errorCount++;
        errors.push({
          content: `**${errorCount}**) **Invalid Hours** - only numbers can be used to set Hours. (Example: 13:30 for 1:30 pm)`
        });
        Passed = false;
      }
    }

    if (!Number.parseInt(minute) || hour.length > 2) {
      if (minute != '00') {
        errorCount++;
        errors.push({
          content: `**${errorCount}**) **Invalid Minutes** - only numbers can be used to set Minutes. (Example: 13:30 for 1:30 pm)`
        });
        Passed = false;
      }
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
        content: `**${errorCount}**) **Invalid Date** - only numbers can be used to set the Date`
      });
      Passed = false;
    }

    if (
      Number.parseInt(month) > 12 ||
      month.length != 2 ||
      day.length != 2 ||
      year.length != 4
    ) {
      errorCount++;
      errors.push({
        content: `**${errorCount}**) **Invalid Syntax** - Date is formatted MM/DD/YYYY`
      });
      Passed = false;
    }

    if (repeat) {
      if (repeat == 'Monthly' && Number.parseInt(day) > 28) {
        errorCount++;
        errors.push({
          content: `**${errorCount}**) **Invalid Setting Combo** - Day cannot be after the 28th with "Monthly" Repeat setting enabled. (Blame February <3)`
        });
        Passed = false;
      }
    }
  }
  if (event.length > EmbedLimits.MaximumTitleLength) {
    errorCount++;
    errors.push({
      content: `**${errorCount}**) **Limitation** - Event titles have a maximum length of ${EmbedLimits.MaximumTitleLength} characters`
    });

    Passed = false;
  }
  if (description) {
    if (description.length > EmbedLimits.MaximumDescriptionLength) {
      errorCount++;
      errors.push({
        content: `**${errorCount}**) **Limitation** - Descriptions have a maximum length of ${EmbedLimits.MaximumDescriptionLength} characters`
      });
      Passed = false;
    }
  }
  if (!Passed) {
    const errorEmbed = new MessageEmbed()
      .setColor('BLURPLE')
      .setAuthor({
        name: `Reminder - Error Message`,
        iconURL: interaction.user.displayAvatarURL()
      })
      .setDescription('**There was an error processing your request!**');
    new PaginatedFieldMessageEmbed()
      .setTitleField(`:x: Issues`)
      .setTemplate(errorEmbed)
      .setItems(errors)
      .formatItems((item: any) => `> ${item.content}`)
      .setItemsPerPage(5)
      .make()
      .run(interaction as CommandInteraction);
  }

  return Passed;
}

export async function askForDateTime(interaction: CommandInteraction) {
  const modal = new Modal()
    .setCustomId('Reminder-TimeZone' + interaction.id)
    .setTitle('Reminder - New User Setup');
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
    time: 10 * 60000
  });

  const dateInput = submission.fields.getTextInputValue(
    'date' + interaction.id
  );
  const timeInput = submission.fields.getTextInputValue(
    'time' + interaction.id
  );
  if (checkInputs(submission, 'placeholder', timeInput, dateInput)) {
    await findTimeZone(interaction, timeInput, dateInput);

    await submission.reply({
      content: 'Your Time Zone Offset has been saved',
      ephemeral: true
    });
  }
}

export function padTo2Digits(num: any) {
  return num.toString().padStart(2, '0');
}

interface Reminder {
  event: string;
  description: string;
  dateTime: string;
  timeZone: number;
  repeat: string;
}
