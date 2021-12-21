require('@lavaclient/queue/register');
const fs = require('fs');
const ExtendedClient = require('./utils/ExtendedClient');
const { REST } = require('@discordjs/rest');
const { Routes } = require('discord-api-types/v9');
const { Collection } = require('discord.js');
const {
  token,
  client_id,
  guild_id,
  spotify_client_id,
  spotify_client_secret
} = require('./config.json');
const { load } = require('@lavaclient/spotify');

load({
  client: {
    id: spotify_client_id,
    secret: spotify_client_secret
  },
  autoResolveYoutubeTracks: true
});

const rest = new REST({ version: '9' }).setToken(token);

const client = new ExtendedClient();
client.commands = new Collection();
const commands = [];

client.music.on('connect', () => {
  console.log('Connected to LavaLink');
});

client.music.on('queueFinish', (queue) => {
  queue.channel.send({ content: 'No more songs in queue' });
  queue.player.disconnect();
  queue.player.node.destroyPlayer(queue.player.guildId);
});

client.music.on('trackStart', (queue, song) => {
  queue.channel.send({ content: `Now playing ${song.title}` });
});

client.on('ready', () => {
  client.music.connect(client.user.id);
  console.log('ready!');
});

const commandFiles = fs
  .readdirSync('./commands')
  .map((folder) =>
    fs
      .readdirSync(`./commands/${folder}`)
      .filter((file) => file.endsWith('.js'))
      .map((file) => `./commands/${folder}/${file}`)
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

    await rest.put(Routes.applicationGuildCommands(client_id, guild_id), {
      body: commands
    });

    console.log('Successfully reloaded application (/) commands.');
  } catch (error) {
    console.error(error);
  }
})();

const eventFiles = fs
  .readdirSync('./events')
  .filter((file) => file.endsWith('.js'));

for (const file of eventFiles) {
  const event = require(`./events/${file}`);
  if (event.once) {
    client.once(event.name, (...args) => event.execute(...args, client));
  } else {
    client.on(event.name, (...args) => event.execute(...args, client));
  }
}

client.login(token);
