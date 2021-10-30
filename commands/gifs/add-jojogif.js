const { SlashCommandBuilder } = require('@discordjs/builders');
const { ownerID, devID } = require('../../config.json');

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
    execute(interaction, message) {
        const gif = interaction.options.get('gif').value;
        if ( message.mentions.users.id === ownerID || devID )
            return fs.writeTxtFILE('././resources/gifs/jojolinks.txt', gif + '\n', { flag: 'a+' })
        else if not ( message.mentions.users.id === ownerID || devID )
            return message.reply(":x: You do not have permission to use this command");
    }
};
