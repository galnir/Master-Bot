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
            description: 'Get any anime gif via query.',
            examples: [
                '`' + config.prefix + 'animegif one punch man`'
                      ],
            throttling: {
                usages: 1,
                duration: 4,
      args: [
        {
          key: 'text',
          prompt: ':thinking: What gif would you like to watch?',
          type: 'string',
          validate: function validateText(text) {
            return text.length < 50;
          }
        }
      ]
            }
        });
    }

    run(message, {text}) {
        const embed = new MessageEmbed();    
        fetch(
            'https://api.tenor.com/v1/random?key=' + config.tenorAPI + '&q=anime-' + text + '&limit=1'
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
