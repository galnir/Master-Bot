const { SlashCommandBuilder } = require('@discordjs/builders');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('add-gintamagif')
        .setDescription('Add a Gintama Gif.')
        .addStringOption(option =>
            option
                .setName('gif')
                .setDescription('What gif would you like to add?')
                .setRequired(true)
        ),
    execute(interaction) {
        const gif = interaction.options.get('gif').value;
        fs.writeTxtFILE('././resources/gifs/gintamalinks.txt', gif + '\n', { flag: 'a+' });
    }
};
