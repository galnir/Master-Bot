const Discord = require('discord.js');
const snekfetch = require('snekfetch');

module.exports = {
    name: 'fortune',
    cooldown: 5,
    description: 'Returnes random fortune cookie',
    async execute(message, args) {
        const response = await snekfetch.get('http://yerkee.com/api/fortune');
        const embed = new Discord.RichEmbed()
            .setColor('RANDOM')
            .setTitle('Fortune Cookie')
            .setDescription(response.body.fortune);
        message.channel.send(embed);
    },
};