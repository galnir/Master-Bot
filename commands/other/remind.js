const { SlashCommandBuilder } = require('@discordjs/builders');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('remind')
        .setDescription('Sets a timed alert')
        .addStringOption(option =>
            option
                .setName('reminder_message')
                .setDescription('What would you like the reminder to say?')
                .setRequired(true)
        )
        .addIntegerOption(option =>
            option
                .setName('number')
                .setDescription('Enter a **Number** for your units')
                .setRequired(true)
        )
        .addStringOption(option =>
            option
                .setName('unit')
                .setDescription('What is the **Unit** of time?')
                .setRequired(true)
                .addChoice('Week', 'weeks')
                .addChoice('Days', 'days')
                .addChoice('Hours', 'hours')
                .addChoice('Minutes', 'minutes')
        ),
    execute(interaction) {
        // Create if not present
        interaction.member.reminders ? null : (interaction.member.reminders = []);

        if (interaction.member.reminders.length > 5) {
            interaction.reply(`:x: Maximum Reminder Limit Reached`);
            return;
        }

        const reminderMessage = interaction.options.getString("reminder_message");
        const number = interaction.options.getInteger("number");
        const unit = interaction.options.getString("unit");

        // Max possible number is (30,758,400,000) because of the MS conversion
        if (
            (number > 52 && unit.startsWith('w')) ||
            (number > 365 && unit.startsWith('d')) ||
            (number > 8544 && unit.startsWith('h')) ||
            (number > 512640 && unit.startsWith('m'))
        ) {
            return interaction.reply(
                `:x: Sorry **${number} ${unit}** is too long`
            );
        }

        const timer = unit.startsWith('w')
            ? number * 10080
            : null || unit.startsWith('d')
                ? number * 1440
                : null || unit.startsWith('h')
                    ? number * 60
                    : number;

        const reminder = setTimeout(async () => {
            await interaction.channel.send(
                `${reminderObject.author} :alarm_clock: Reminder: ${reminderMessage}`
            );
            for (let i = 0; i < interaction.member.reminders.length; i++) {
                if (interaction.member.reminders[i] === reminderObject) {
                    interaction.member.reminders.splice(i,1);
                }
            }
        }, timer * 60000);

        const reminderObject = {
            author: interaction.member,
            text: reminderMessage,
            timer: reminder
        };

        interaction.member.reminders.push(reminderObject);

        interaction.reply(
            `:white_check_mark: Reminder is set: ${reminderMessage}`
        );

        return;

    }
};
