const fetch = require('node-fetch');
const config = require('../../config.json');
const { Command } = require('discord.js-commando');
const { MessageEmbed } = require('discord.js');

if (!config.tenorAPI) return;

module.exports = class AnimegifCommand extends Command {
    constructor(client) {
        super(client, {
            name: 'animegif',
            group: 'gifs',
            aliases: [
                'anime-gif',
                'anime-gifs',
            ],
            memberName: 'animegif',
            description: 'Provide a name of an anime show or character and I will return a gif!',
            examples: [
                '`' + config.prefix + 'animegif`',
                '`' + config.prefix + 'animegif Bleach`',
                '`' + config.prefix + 'animegif Yoruichi`'
                      ],
            throttling: {
                usages: 1,
                duration: 4
            }
        });
    }

    run(message) {
        const embed = new MessageEmbed();    
        fetch(
            'https://api.tenor.com/v1/random?key=' + config.tenorAPI + '&q=anime&limit=1'
        )
        .then(res => res.json())
        .then(json => {
            embed.setColor("RANDOM")
            embed.setImage(json.results[0].media[0].gif.url);
            message.channel.send(embed)
        })
            .catch(e => {
                message.channel.send(':x: Failed to fetch a gif')
            .console.error(e);
            return;
        })
    };
};
