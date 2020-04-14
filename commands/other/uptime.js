const { Command } = require('discord.js-commando');

module.exports = class UptimeCommand extends Command {
  constructor(client) {
    super(client, {
      name: 'uptime',
      aliases: ['alive', 'up'],
      memberName: 'uptime',
      group: 'other',
      description: "Replies with the bot's total uptime."
    });
  }
  run(message) {
    var seconds = parseInt((this.client.uptime / 1000) % 60),
      minutes = parseInt((this.client.uptime / (1000 * 60)) % 60),
      hours = parseInt((this.client.uptime / (1000 * 60 * 60)) % 24);
    // prettier-ignore
    hours = (hours < 10) ? ('0' + hours) : hours;
    // prettier-ignore
    minutes = (minutes < 10) ? ('0' + minutes) : minutes;
    // prettier-ignore
    seconds = (seconds < 10) ? ('0' + seconds) : seconds;
    return message.say(
      `:chart_with_upwards_trend: I've been running for **${hours}** hours, **${minutes}** minutes and **${seconds}** seconds!`
    );
  }
};
