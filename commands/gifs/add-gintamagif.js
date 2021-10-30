const { SlashCommandBuilder } = require('@discordjs/builders');
const { ownerID, devID } = require('../../config.json');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('add-gintamagif')
        .setDescription('Add a Ginatma Gif.')
        .addStringOption(option =>
            option
                .setName('gif')
                .setDescription('What gif would you like to add?')
                .setRequired(true)
        ),
    execute(interaction, message) {
        const gif = interaction.options.get('gif').value;
        if ( message.mentions.users.id === ownerID || devID )
            return fs.writeTxtFILE('././resources/gifs/gintamaliks.txt', gif + '\n', { flag: 'a+' })
        else if not ( message.mentions.users.id === ownerID || devID )
            return message.reply(":x: You do not have permission to use this command");
    }
};
