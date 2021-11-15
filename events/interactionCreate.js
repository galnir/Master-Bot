module.exports = {
  name: 'interactionCreate',
  async execute(interaction) {
    if (!interaction.isCommand()) return;

    if (!interaction.client.commands.has(interaction.commandName)) return;

    try {
      await interaction.client.commands
        .get(interaction.commandName)
        .execute(interaction);
    } catch (error) {
      console.error(error);
      return interaction.reply({
        content: 'Da ist etwas beim ausführen des Commands schief gelaufen!',
        ephemeral: true
      });
    }
  }
};
