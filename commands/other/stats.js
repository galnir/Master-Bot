const { Command } = require('discord.js-commando');
const { MessageEmbed } = require('discord.js')


module.exports = class StatsCommand extends Command {
    constructor(client) {
        super(client, {
            name: 'other',
            aliases: ['info', 'botinfo', 'statistics', 'uptime', 'ram', 'ping', 'stat'],
            group: 'music',
            memberName: 'stats',
            guildOnly: true,
            description: 'Detailed Bot Statistics',
            throttling: {
                usages: 1,
                duration: 30
            }
        });
    }

    run(message) {

        let totalSeconds = (this.client.uptime / 1000);
        let days = Math.floor(totalSeconds / 86400);
        let hours = Math.floor(totalSeconds / 3600);
        totalSeconds %= 3600;
        let minutes = Math.floor(totalSeconds / 60);
        let seconds = Math.floor(totalSeconds % 60);
        let uptime = `${days} days, ${hours} hours, ${minutes} minutes and ${seconds} seconds`;

        const embed = new MessageEmbed()
            .setColor('RANDOM')
            .addField('Server Count', this.client.guilds.cache.size, true)
            .addField('Bot Latency', this.client.ws.ping + 'ms')
            .addField('Command Count', this.client.registry.commands.size, false)
            .addField('Shard Count', this.client.options.shardCount, true)
            .addField('Voice Connection Count', this.client.voice.connections.size, false)
            .addField('Invite Link', `[Invite](https://discord.com/oauth2/authorize?client_id=${this.client.user.id}&scope=bot&permissions=36701440)`)
            .addField('Memory Usage', `${Math.round(process.memoryUsage().heapUsed / 1024 / 1024)}MB`, true)
            .addField('Uptime', uptime, false)

        message.say(embed)
    }
};
