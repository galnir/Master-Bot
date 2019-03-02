const { CommandoClient } = require('discord.js-commando');
const path = require('path');
const { prefix, token } = require('./config.json');

const client = new CommandoClient({
  commandPrefix: prefix,
  owner: '183647046564184065',
  unknownCommandResponse: false
});

client.registry
  .registerDefaultTypes()
  .registerGroups([
    ['music', 'Music Command Group'],
    ['gifs', 'Gif Command Group'],
    ['other', 'random types of commands group'],
    ['guild', 'guild related commands']
  ])
  .registerDefaultGroups()
  .registerDefaultCommands()
  .registerCommandsIn(path.join(__dirname, 'commands'));

client.once('ready', () => {
  console.log('Ready!');
  client.user.setActivity('!help for commands', 'WATCHING');
});

client.login(token);
