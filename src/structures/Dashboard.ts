* --- CONFIG FILE --- */

import * as data from '../config.json'

/* --- DISCORD.JS CLIENT --- */

const { Client, Intents } = require('discord.js');
const client = new Client({ intents: [Intents.FLAGS.GUILDS] });

const DarkDashboard = require('dbd-dark-dashboard');

/* --- DASHBOARD --- */

(async () => {
  let DBD = require('discord-dashboard');
  await DBD.useLicense(data.dbdLicense);
  DBD.Dashboard = DBD.UpdatedClass();

  const Dashboard = new DBD.Dashboard({
    port: 3000,
    client: {
      id: data.client_id,
      secret: data.client_secret
    },
    redirectUri: data.redirect_url,
    domain: data.dbdDomain,
    bot: client,
    theme: DarkDashboard({
      information: {
        createdBy: "iMidnight",
        websiteTitle: "Dashboard",
        websiteName: "Add Bot",
        websiteUrl: data.botInviteUrl,
        dashboardUrl: data.dashboardUrl,
        acceptPrivacyPolicy: true,
        supporteMail: data.supportEmail,
        supportServer: data.discordServerInvite,
        imageFavicon: data.faviconUrl,
        iconURL: data.iconUrl,
        pageBackGround: "linear-gradient(#2CA8FF, #155b8d)",
        loggedIn: "Successfully signed in.",
        mainColor: "#2CA8FF",
        subColor: "#ebdbdb",
      },
      index: {
        card: {
          category: "Discord Bot Dashboard - The center of everything",
          title: `Welcome to the Discord Bot Dashboard!`,
          image: "https://i.imgur.com/axnP93g.png",
          footer: "Discord Bot Dashbaord"
        },
        information: {
          category: "Information",
          title: "Notice",
          description: "You can see all of my commands in the Commands page.",
          footer: "Discord Bot Dashbaord"
        },
        feeds: {
          category: "Credits",
          title: "Contributors",
          description: `Bacon Fixation, ModoSN, Natemo6348, kfirmeg, rafaeldamasceno, navidmafi, Kyoyo, MontejoJorge, malokdev, chimaerra`,
          footer: "Discord Bot Dashbaord",
        },
      },
      commands: [
        {
          category: "Commands",
          subTitle: "A complete list of available commands",
          aliasesDisabled: true,
          list: [
            {
              commandName: "play",
              commandUsage: "/play darude sandstorm",
              commandDescription: "Play any song or playlist from youtube, you can do it by searching for a song by name or song url or playlist url",
              commandAlias: "None"
            },
            {
              commandName: "pause",
              commandUsage: "/pause",
              commandDescription: "Pause the current playing song",
              commandAlias: "None"
            },
            {
              commandName: "resume",
              commandUsage: "/resume",
              commandDescription: "Resume the current paused song",
              commandAlias: "None"
            },
            {
              commandName: "leave",
              commandUsage: "/leave",
              commandDescription: "Leaves the voice channel if in one",
              commandAlias: "None"
            },
            {
              commandName: "remove",
              commandUsage: "/remove 4",
              commandDescription: "Remove a specific song from the queue by it's number in the queue",
              commandAlias: "None"
            },
            {
              commandName: "queue",
              commandUsage: "/queue",
              commandDescription: "Display the song queue",
              commandAlias: "None"
            },
            {
              commandName: "shuffle",
              commandUsage: "/shuffle",
              commandDescription: "Shuffle the song queue",
              commandAlias: "None"
            },
            {
              commandName: "skip",
              commandUsage: "/skip",
              commandDescription: "Skip the currently playing song",
              commandAlias: "None"
            },
            {
              commandName: "skip all",
              commandUsage: "/skipall",
              commandDescription: "Skip all songs in the queue",
              commandAlias: "None"
            },
            {
              commandName: "skip to",
              commandUsage: "/akipto 5",
              commandDescription: "Skip to a specific song in the queue, provide the song number as an argument",
              commandAlias: "None"
            },
            {
              commandName: "volume",
              commandUsage: "/volume 80",
              commandDescription: "Adjust the song volume",
              commandAlias: "None"
            },
            {
              commandName: "music trivia",
              commandUsage: "/music-trivia",
              commandDescription: "Engage in music trivia with your friends. You can add more songs to the trivia pool in resources/music/musictrivia.json",
              commandAlias: "None"
            },
            {
              commandName: "loop",
              commandUsage: "/loop",
              commandDescription: "Loop the currently playing song or queue",
              commandAlias: "None"
            },
            {
              commandName: "lyrics",
              commandUsage: "/lyrics song-name",
              commandDescription: "Get the lyrics of any song or the lyrics of the currently playing song",
              commandAlias: "None"
            },
            {
              commandName: "now playing",
              commandUsage: "/now-playing",
              commandDescription: "Display the currently playing sonh with a playback bar",
              commandAlias: "None"
            },
            {
              commandName: "move",
              commandUsage: "/move 8 1",
              commandDescription: "Move a song to a desired position in the queue",
              commandAlias: "None"
            },
            {
              commandName: "queue history",
              commandUsage: "/queue-history",
              commandDescription: "Display the queue history",
              commandAlias: "None"
            },
            {
              commandName: "cat",
              commandUsage: "/cat",
              commandDescription: "Display a random cat gif",
              commandAlias: "None",
            },
            {
              commandName: "dog",
              commandUsage: "/dog",
              commandDescription: "Display a random dog gif",
              commandAlias: "None",
            },
            {
              commandName: "anime",
              commandUsage: "/anime",
              commandDescription: "Display a random anime gif",
              commandAlias: "None",
            },
            {
              commandName: "baka",
              commandUsage: "/baka",
              commandDescription: "Display a random baka gif",
              commandAlias: "None",
            },
            {
              commandName: "jojo",
              commandUsage: "/jojo",
              commandDescription: "Display a random JoJo gif",
              commandAlias: "None",
            },
            {
              commandName: "gintama",
              commandUsage: "/gintama",
              commandDescription: "Display a random Gintama gif",
              commandAlias: "None",
            },
            {
              commandName: "gif",
              commandUsage: "/gif",
              commandDescription: "Display a random gif",
              commandAlias: "None",
            },
            {
              commandName: "fortune",
              commandUsage: "/fortune",
              commandDescription: "Get a fortune cookie tip",
              commandAlias: "None",
            },
            {
              commandName: "insult",
              commandUsage: "/insult",
              commandDescription: "Generate an evil insult",
              commandAlias: "None",
            },
            {
              commandName: "chuck norris",
              commandUsage: "/chucknorris",
              commandDescription: "Get a satirical fact about Chuck Norris",
              commandAlias: "None",
            },
            {
              commandName: "motivation",
              commandUsage: "/motivation",
              commandDescription: "Get a random motivational quote",
              commandAlias: "None",
            },
            {
              commandName: "world news",
              commandUsage: "/world-news",
              commandDescription: "Latest headlines.",
              commandAlias: "None",
            },
            {
              commandName: "random",
              commandUsage: "/random 0 100",
              commandDescription: "Generate a random number between two provided numbers",
              commandAlias: "None",
            },
            {
              commandName: "translate",
              commandUsage: "/translate english ?????",
              commandDescription: "Translate any language using Google Translate (Only supported languages)",
              commandAlias: "None",
            },
            {
              commandName: "about",
              commandUsage: "/about",
              commandDescription: "Information about Master Bot",
              commandAlias: "None",
            },
            {
              commandName: "8ball",
              commandUsage: "/8ball Is this bot awesome?",
              commandDescription: "Get the answer to anything",
              commandAlias: "None",
            },
            {
              commandName: "rcok paper scissors",
              commandUsage: "/rps",
              commandDescription: "Play Rock, Paper, Scissors!",
              commandAlias: "None",
            },
            {
              commandName: "bored",
              commandUsage: "/bored",
              commandDescription: "Generate a random activity!",
              commandAlias: "None",
            },
            {
              commandName: "advice",
              commandUsage: "/advice",
              commandDescription: "Get some advice",
              commandAlias: "None",
            },
            {
              commandName: "kanye",
              commandUsage: "/kanye",
              commandDescription: "Get a random Kanye quote",
              commandAlias: "None",
            },
            {
              commandName: "urban",
              commandUsage: "/urban javascript",
              commandDescription: "Get definitions from Urban Dictionary",
              commandAlias: "None",
            },],
        },
      ],
    }),
    settings: [
      {
        categoryId: 'settings',
        categoryName: "Setings",
        categoryDescription: "Guild management"
        //
        // This sections is currently under construcion. 
        // Once complete it will give a use to the Setup button in the Guild Management tab.
        //
        // categoryOptionsList: [
        //   {
        //     optionId: 'setup',
        //     optionName: "Setup",
        //     optionDescription: "",
        //     optionType: DBD.formTypes.textarea('Queue', 0, 100, false, false),
        //     getActualSet: async ({}) => {}
        //   ],
        //
      },
    ]
  });

  Dashboard.init();
})();
