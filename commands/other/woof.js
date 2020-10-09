const client = require('nekos.life');
const neko = new client();

const { Command } = require('discord.js-commando');

module.exports = class JojoCommand extends Command {
  constructor(client) {
    super(client, {
      name: 'woof',
      aliases: ['dog', 'doggo'],
      group: 'other',
      memberName: 'woof',
      description: 'Replies with a random dog image!',
      throttling: {
        usages: 2,
        duration: 8
      }
    });
  }

  run(message) {
    try { 
        neko.sfw.woof().then((woof) => message.channel.send(woof.url));
    } catch (e) {
      message.say('Failed to fetch a image :slight_frown:');
      return console.error(e);
    }
  }
};
