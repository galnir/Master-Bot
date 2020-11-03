const { CommandoClient } = require('discord.js-commando');
const { Structures } = require('discord.js');
const path = require('path');
const { prefix, token, discord_owner_id } = require('./config.json');
const Discord = require('discord.js');
const Canvas = require('canvas');

Structures.extend('Guild', function(Guild) {
  class MusicGuild extends Guild {
    constructor(client, data) {
      super(client, data);
      this.musicData = {
        queue: [],
        isPlaying: false,
        nowPlaying: null,
        songDispatcher: null,
        skipTimer: false, // only skip if user used leave command
        loopSong: false,
        loopQueue: false,
        volume: 1
      };
      this.triviaData = {
        isTriviaRunning: false,
        wasTriviaEndCalled: false,
        triviaQueue: [],
        triviaScore: new Map()
      };
    }
  }
  return MusicGuild;
});

// These values come from config.json
const client = new CommandoClient({
  commandPrefix: prefix,
  owner: discord_owner_id
});

// Setting up the groups and names for the help command
client.registry
  .registerDefaultTypes()
  .registerGroups([
    ['music', ':notes: Music Command Group:'],
    ['gifs', ':film_frames: Gif Command Group:'],
    ['other', ':loud_sound: Other Command Group:'],
    ['guild', ':speaker: Guild Related Commands:']
  ])
  .registerDefaultGroups()
  .registerDefaultCommands({
    eval: false,
    prefix: false,
    commandState: false
  })
  .registerCommandsIn(path.join(__dirname, 'commands'));

// Profile Info of the bot when it's running
client.once('ready', () => {
  console.log('Ready!');
  client.user.setActivity(`${prefix}help`, {
    type: 'WATCHING',
    url: 'https://github.com/galnir/Master-Bot'
  });
  const Guilds = client.guilds.cache.map(guild => guild.name);
  if (client.guilds.cache.map(guild => guild.name)) {
    console.log(Guilds, 'Connected!');
  } else {
    console.log(
      `Error couldn't connect to discord, Double check your config.json`
    );
  }
});

client.on('voiceStateUpdate', async (___, newState) => {
  if (
    newState.member.user.bot &&
    !newState.channelID &&
    newState.guild.musicData.songDispatcher &&
    newState.member.user.id == client.user.id
  ) {
    newState.guild.musicData.queue.length = 0;
    newState.guild.musicData.songDispatcher.end();
    return;
  }
  if (
    newState.member.user.bot &&
    newState.channelID &&
    newState.member.user.id == client.user.id &&
    !newState.selfDeaf
  ) {
    newState.setSelfDeaf(true);
  }
});

// Custom Welcome Image for new members
const applyText = (canvas, text) => {
  const ctx = canvas.getContext('2d');
  let fontSize = 70;

  do {
    ctx.font = `${(fontSize -= 10)}px sans-serif`;
  } while (ctx.measureText(text).width > canvas.width - 300);

  return ctx.font;
};

client.on('guildMemberAdd', async member => {
  const channel = member.guild.channels.cache.find(ch => ch.name === 'general'); // change this to the channel name you want to send the greeting to
  if (!channel) return;

  const canvas = Canvas.createCanvas(700, 250); // Set the dimensions (Width, Height) 
  const ctx = canvas.getContext('2d');

  const background = await Canvas.loadImage(
    './resources/welcome/wallpaper.jpg' // can add what ever image you want for the Background just make sure that the filename matches
  );
  ctx.drawImage(background, 0, 0, canvas.width, canvas.height);

  ctx.strokeStyle = '#000000'; // the color of the trim on the outside of the welcome image
  ctx.strokeRect(0, 0, canvas.width, canvas.height);

  ctx.font = '26px sans-serif';
  ctx.fillStyle = '#FFFFFF'; // Main Color of the Text on the top of the welcome image
  ctx.fillText(
    `Welcome to ${member.guild.name}`,
    canvas.width / 2.5,
    canvas.height / 3.5
  );
  ctx.strokeStyle = `#000000`; // Secondary Color of Text on the top of welcome for depth/shadow the stroke is under the main color
  ctx.strokeText(
    `Welcome to ${member.guild.name}`,
    canvas.width / 2.5,
    canvas.height / 3.5
  );

  ctx.font = applyText(canvas, `${member.displayName}!`);
  ctx.fillStyle = '#FFFFFF'; // Main Color for the members name for the welcome image
  ctx.fillText(
    `${member.displayName}!`,
    canvas.width / 2.5,
    canvas.height / 1.8
  );
  ctx.strokeStyle = `#FF0000`; // Secondary Color for the member name to add depth/shadow to the text
  ctx.strokeText(
    `${member.displayName}!`,
    canvas.width / 2.5,
    canvas.height / 1.8
  );

  ctx.beginPath();
  ctx.arc(125, 125, 100, 0, Math.PI * 2, true);
  ctx.closePath();
  ctx.clip();

  const avatar = await Canvas.loadImage(
    member.user.displayAvatarURL({ format: 'jpg' })
  );
  ctx.drawImage(avatar, 25, 25, 200, 200);

  const attachment = new Discord.MessageAttachment(
    canvas.toBuffer(),
    'welcome-image.png'
  );

  var embed = new Discord.MessageEmbed()
    .setTitle(
      `:speech_balloon: Hey ${member.displayName}, Welcome to ${member.guild.name}!`
    )
    .setColor(`RANDOM`)
    .attachFiles(attachment)
    .setImage('attachment://welcome-image.png')
    .setFooter(`Type ${prefix}help for a feature list!`)
    .setTimestamp();
  channel.send(embed);
});

// Uncomment below to test the Custom Welcome Image with a !join command
// client.on('message', message => {
//   if (message.content === '!join') {
//     client.emit('guildMemberAdd', message.member);
//   }
// });

// Bot logs in with the values in the config.json
client.login(token);
