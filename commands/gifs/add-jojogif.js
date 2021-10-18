const { SlashCommandBuilder } = require('@discordjs/builders');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('add-jojogif')
        .setDescription('Add a JoJo Gif.')
        .addStringOption(option =>
            option
                .setName('gif')
                .setDescription('What gif would you like to add?')
                .setRequired(true)
        ),
    execute(interaction) {
        const gif = interaction.options.get('gif').value;
        fs.writeTxtFILE('././resources/gifs/jojolinks.txt', gif + '\n', { flag: 'a+' });
    }
};
