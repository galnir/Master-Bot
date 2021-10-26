const fs = require('fs');
const { REST } = require('@discordjs/rest');
const { Routes } = require('discord-api-types/v9');
const { Client, Collection, Intents } = require('discord.js');
const aws = require('aws-sdk');

const token = new aws.Token({
  token: process.env.token
});

const client_id = new aws.Client_id({
  client_id: process.env.client_id
});

const rest = new REST({ version: '9' }).setToken(token);

const client = new Client({
  intents: [
    Intents.FLAGS.GUILDS,
    Intents.FLAGS.GUILD_MEMBERS,
    Intents.FLAGS.GUILD_MESSAGES,
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
  if (Object.keys(command).length === 0) continue;
  commands.push(command.data.toJSON());
  client.commands.set(command.data.name, command);
}

(async () => {
  try {
    console.log('Started refreshing application (/) commands.');

    await rest.put(Routes.applicationCommands(client_id), {
      body: commands
    });

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

client.login(token);
