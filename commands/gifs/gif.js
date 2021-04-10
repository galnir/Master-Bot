const fetch = require('node-fetch');
const config = require('../../config.json');
const { Command } = require('discord.js-commando');
const { MessageEmbed } = require('discord.js');

if (!config.tenorAPI) return;

module.exports = class GifCommand extends Command {
    constructor(client) {
        super(client, {
            name: 'gif',
            group: 'gifs',
            aliases: ['search-gif', 'search-gifs'],
            memberName: 'gif',
            description: 'Provide a query and replies with a gif!',
            examples: [
                '`' + config.prefix + 'gif puppy`',
                      ],
            throttling: {
                usages: 1,
                duration: 4
            },
            args: [{
                key: 'text',
                prompt: 'What gif would you like to post?',
                type: 'string',
                validate: function validateText(text) {
                    return text.length < 50;
                }
            }]
        });
    }

    run(message, { text }) {
        const embed = new MessageEmbed();
        fetch(
            'https://api.tenor.com/v1/random?key=' + config.tenorAPI + '&q=' + text + '&limit=1'
        )
            .then(res => res.json())
            .then(json => {
            embed.setColor("RANDOM")
            embed.setImage(json.results[0].media[0].gif.url);
            message.channel.send(embed)
        })
            .catch(e => {
                message.channel.send('Failed to fetch a gif')
            .console.error(e);
            return;
        })
    };
};
