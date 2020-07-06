const { Command } = require('discord.js-commando');

module.exports = class RestartCommand extends Command {
    constructor(client) {
        super(client, {
            name: 'restart',
            aliases: ['exit'],
            group: 'music',
            memberName: 'restart',
            guildOnly: true,
            description: 'Make the bot restart it self',
            ownerOnly: true,
            hidden: true
        });
    }

    run() {

        //if you are using any uptime manager like pm2 the bot will restart it self after the process exits
        process.exit()

        //incase you wish to return a message use .then once the message is sent and it shall do it for you.

    }
};
