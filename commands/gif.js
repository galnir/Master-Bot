
const Discord = require('discord.js');
const snekfetch = require('snekfetch');
const {
    giphyAPI
} = require('../config.json');

module.exports = {
    name: 'gif',
    cooldown: 5,
    description: 'gif!',
    async execute(message, args) {
        try {
            if(args.length < 1) return message.channel.send('Add an argument and try again')
            const response = await snekfetch.get(`https://api.giphy.com/v1/gifs/search?api_key=${giphyAPI}&q=${args}&limit=25&offset=0&rating=G&lang=en`);
            message.channel.send(response.body.data[0].url);
            /*
            const embed = new Discord.RichEmbed()
            .setURL(response.body.data[0].url)
            .setAuthor(message.author.tag, message.author.displayAvatarURL)
            message.channel.send({embed: embed});
            */
           // embed is commented out because for some reason discord wont display gifs if set as images even tho it worked in the past
        } catch (err) {
            console.error(err);
            message.channel.send('Failed to find a gif that matched your query');
        }
    }
}