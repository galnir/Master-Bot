const fs = require('fs');
const { Command } = require('discord.js-commando');
const { prefix } = require('../../config.json');

module.exports = class AddGifCommand extends Command {
    constructor(client) {
        super(client, {
            name: 'addgif',
            aliases: ['add-gif', 'agif'],
            memberName: 'addgif',
            group: 'dev',
            description: 'Adds a Gif to the Gif commands.',
            examples: [
                '`' + prefix + 'addgif Jojo https://jojo-gif.gif"`'
            ],
            guildOnly: false,
            userPermissions: [
                'MANAGE_GUILD',
                'MANAGE_MESSAGES',
                'SEND_MESSAGES'
            ],
            clientPermisiions: [
                'MANAGE_GUILD',
                'MANAGE_MESSAGES',
                'SEND_MESSAGES'
            ],
            args: [
                {
                    key: 'txtFilePath',
                    prompt: 'Please select a File Name from the list below:\n\nGintama\nJojo\n',
                    type: 'string'
                },
                {
                    key: 'Url',
                    prompt: 'Which gif would you like to add?',
                    type: 'string'
                }
            ],
            throttling: {
                usages: 2,
                duration: 8
            }
        });
    }

    async run(message, { gifCategory, txtFilePath, Url }) {
        if (message.member.roles.cache.some(r => [
                'ROLE_ID',
                'ROLE_ID'
            ].includes(r.id))) {

            fs.writeTxtFILE('././resources/gifs/' + txtFilePath + '.txt', Url + '\n', { flag: 'a+' }, (err) => {
                if (err) return console.error(err)
                else return message.channel.send('☑️ Successfully added `' + Url + '` to `../../resources/gifs/' + txtFilePath + '/.txt`')
            })
        } else {
            return message.channel.send('❌ This command can only be used by my Developers...').catch(err => {
                console.log(err.code + ': (' + err.message + ')\n' + err.stack)
            })
        }
    }
};
