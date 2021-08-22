const fs = require('fs');
const { REST } = require('@discordjs/rest');
const { Routes } = require('discord-api-types/v9');
const { Client, Collection, Intents } = require('discord.js');
const { token, mongo_URI } = require('./config.json');
const mongoose = require('mongoose');
const createGuildData = require('./utils/createGuildData');

const rest = new REST({ version: '9' }).setToken(token);

const client = new Client({
  intents: [
    Intents.FLAGS.GUILDS,
    Intents.FLAGS.GUILD_MEMBERS,
    Intents.FLAGS.GUILDS,
    Intents.FLAGS.GUILD_VOICE_STATES
  ]
});

client.commands = new Collection();
const commands = [];

const commandFiles = fs
  .readdirSync('./commands')
  .map(folder =>
    fs
      .readdirSync(`./commands/${folder}`)
      .filter(file => file.endsWith('.js'))
      .map(file => `./commands/${folder}/${file}`)
  )
  .flat();

for (const file of commandFiles) {
  const command = require(`${file}`);
  commands.push(command.data.toJSON());
  client.commands.set(command.data.name, command);
}

(async () => {
  try {
    console.log('Started refreshing application (/) commands.');

    await rest.put(
      Routes.applicationGuildCommands(
        '497005425489870858',
        '336505000828076032'
      ),
      {
        body: commands
      }
    );

    console.log('Successfully reloaded application (/) commands.');
  } catch (error) {
    console.error(error);
  }
})();

const eventFiles = fs
  .readdirSync('./events')
  .filter(file => file.endsWith('.js'));

for (const file of eventFiles) {
  const event = require(`./events/${file}`);
  if (event.once) {
    client.once(event.name, (...args) => event.execute(...args, client));
  } else {
    client.on(event.name, (...args) => event.execute(...args, client));
  }
}

client.once('ready', () => {
  client.playerManager = new Map();
  client.guildData = new Collection();
  client.guilds.cache.each(guild => {
    client.guildData.set(guild.id, createGuildData());
  });
  mongoose
    .connect(encodeURI(mongo_URI), {
      useNewUrlParser: true,
      useUnifiedTopology: true
    })
    .then(() => {
      console.log('Mongo is ready');
    })
    .catch(console.error);

  console.log('Ready!');
});

client.login(token);
