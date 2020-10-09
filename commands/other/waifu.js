const client = require('nekos.life');
const neko = new client();

const { Command } = require('discord.js-commando');

module.exports = class JojoCommand extends Command {
  constructor(client) {
    super(client, {
      name: 'waifu',
      group: 'other',
      memberName: 'waifu',
      description: 'Replies with your waifu!',
      throttling: {
        usages: 2,
        duration: 8
      }
    });
  }

  run(message) {
    try { 
        neko.sfw.waifu().then((waifu) => message.channel.send(waifu.url));
    } catch (e) {
      message.say('Failed to fetch a image :slight_frown:');
      return console.error(e);
    }
  }
};
