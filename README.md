# A Discord Music Bot written in TypeScript Sapphire, discord.js, Remix and React

[![image](https://img.shields.io/badge/language-typescript-blue)](https://www.typescriptlang.org)
[![image](https://img.shields.io/badge/node-%3E%3D%2016.0.0-blue)](https://nodejs.org/)

## System dependencies

- [Node.js LTS or latest](https://nodejs.org/en/download/)
- [Java 13](https://www.azul.com/downloads/?package=jdk#download-openjdk) (other versions have some issues with Lavalink)

### Installing the Node.js dependencies

Run `npm i` in each folder (bot/ and dashboard/) if you want both the bot and dashboard to be run, or just in bot/ if you only want the bot to be run.

## Setup bot

Create an [application.yml](https://github.com/freyacodes/lavalink/blob/master/LavalinkServer/application.yml.example) file the bot/ folder.

Download the latest Lavalink jar from [here](https://github.com/Cog-Creators/Lavalink-Jars/releases) and place it in the same folder as `application.yml`.

### PostgreSQL

#### Linux

Either from the official site or follow the tutorial for your [distro](https://www.digitalocean.com/community/tutorial_collections/how-to-install-and-use-postgresql).

#### MacOS

Get [brew](https://brew.sh), then enter 'brew install postgresql'.

Create a `.env` file in the bot/ folder and copy the contents of `.env.example` to it. Change 'john' and 'doe' to the name of your OS' user.

#### Windows

Getting Postgres and Prisma to work together on Windows is not worth the hassle. Create an account on [heroku](https://dashboard.heroku.com/apps) and follow these steps:

1. Open the dashboard and click on 'New' > 'Create new app', give it a name and select the closest region to you then click on 'Create app'.
2. Go to 'Resources' tab, under 'Add-ons' search for 'Heroku Postgres' and select it. Click 'Submit Order Form' and then do the same step again (create another postgres instance).
3. Create a `.env` file in bot/ and create 2 empty variables there:
   `DATABASE_URL="" SHADOW_DB_URL=""`
4. Click on each 'Heroku Postgres' addon you created, go to 'Settings' tab > Database Credentials > View Credentials and copy the each one's URI to either `DATABASE_URL` or `SHADOW_DB_URL`.
5. In your terminal, run `npx prisma db push` and then run `npx prisma migrate dev`.
6. Done!

### Redis

#### MacOS
`brew install redis`.

#### Windows
Download from [here](https://redis.io/download/).

#### Linux
Follow the instructions [here](https://redis.io/docs/getting-started/installation/install-redis-on-linux/).

## Important

After you're done installing all the dependencies and entering all tokens and env variables, run `npx prisma migrate dev` **in bot/**.

### Lavalink startup

**Before running `npm run dev` in bot/ (to start the bot), make sure to open a separate terminal in bot/ and run `java -jar LavaLink.jar`**

Create a `config.json` file inside the 'src' directory in bot/ with the following tokens:

### Minimum settings

This is the minimum amount of settings that need to be set for the core part (music) of the bot to work.

**Generate spotify client id and secret [here](https://developer.spotify.com/dashboard/applications)**

**If you're running the bot using Docker, set lava_host's value to "lavalink" in config.json and in application.yml at line 3**

```json
{
  "client_id": "the-bots-client-id",
  "client_secret": "the-bots-client-secret",
  "token": "Your-Bot-Token",
  "lava_host": "0.0.0.0",
  "lava_pass": "youshallnotpass",
  "lava_port": 2333,
  "lava_secure": false,
  "invite_url": "discord-bot-invite",
  "spotify_client_id": "get-it-from-spotify-dev",
  "spotify_client_secret": "get-it-from-spotify-dev"
}
```

### Full settings

For full command support, including lyrics, GIFs, news, and others, - (which some of them are part of [Features to be added back](https://github.com/galnir/Master-Bot/issues/667)) - All of the following settings need to be added. You can also choose to add only the ones for the functionalities you want.

```json
{
  "invite": "false",
  "geniusLyricsAPI": "genius-api-key",
  "tenorAPI": "tenor-API-key",
  "newsAPI": "news-api-key",
  "rawgAPI": "rawg-api-key",
  "twitchClientID": "twitch-client-id",
  "twitchClientSecret": "twitch-client-secret"
}
```

NOTE: When setting `"invite": true`, remember to enable the Public Bot option in the [Discord Developer Portal](https://discordapp.com/developers/applications/).

## Setup dashboard

In order to use the dashboard, the bot must be online because the bot exposes the API routes the dashboard uses to communicate with the database.

### Install dependencies
`npm i` in dashboard/

### OAuth2
Create a `.env` file in the root on dashboard/ with these 3 lines:
```
SESSION_SECRET=""
DISCORD_CLIENT_ID=""
DISCORD_CLIENT_SECRET=""
Invite_URL="https://discord.com/api/oauth2/authorize?client_id=yourclientid&permissions=8&scope=bot%20applications.commands"
```
Fill SESSION_SECRET with some random string.
Now go to your bot's panel in the Discord Developoer Portal > OAuth2, copy the Client ID and place it between the quotes as DISCORD_CLIENT_ID's value and do the same for the Client Secret (you have to click on the blue button to generate it, it is the token you placed in the bot/ folder .env). Also update the client ID in Invite_URL.

Paste this URL to the `Redirects` input below:
`http://localhost:3000/auth/discord/callback` (I will update this in the future when I figure out how to host the dashboard on a VPS).

### Running the dashboard
Only after the bot is online, hit `npm run dev` in a separate terminal.

# Commands

A full list of commands for use with Master Bot

## Music

| Command               | Description                                                                                                               | Usage                                                 |
| --------------------- | ------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------- |
| /play                 | Play any song or playlist from youtube, you can do it by searching for a song by name or song url or playlist url         | /play darude sandstorm                                |
| /pause                | Pause the current playing song                                                                                            | /pause                                                |
| /resume               | Resume the current paused song                                                                                            | /resume                                               |
| /leave                | Leaves voice channel if in one                                                                                            | /leave                                                |
| /remove               | Remove a specific song from queue by its number in queue                                                                  | /remove 4                                             |
| /queue                | Display the song queue                                                                                                    | /queue                                                |
| /shuffle              | Shuffle the song queue                                                                                                    | /shuffle                                              |
| /skip                 | Skip the current playing song                                                                                             | /skip                                                 |
| /skipall              | Skip all songs in queue                                                                                                   | /skipall                                              |
| /skipto               | Skip to a specific song in the queue, provide the song number as an argument                                              | /skipto 5                                             |
| /volume               | Adjust song volume                                                                                                        | /volume 80                                            |
| /music-trivia         | Engage in a music trivia with your friends. You can add more songs to the trivia pool in resources/music/musictrivia.json | /music-trivia                                         |
| /loop                 | Loop the currently playing song or queue                                                                                  | /loop                                                 |
| /lyrics               | Get lyrics of any song or the lyrics of the currently playing song                                                        | /lyrics song-name                                     |
| /now-playing          | Display the current playing song with a playback bar                                                                      | /now-playing                                          |
| /move                 | Move song to a desired position in queue                                                                                  | /move 8 1                                             |
| /queue-history        | Display the queue history                                                                                                 | /queue-history                                        |
| /create-playlist      | Create a custom playlist                                                                                                  | /create-playlist 'playlistname'                       |
| /save-to-playlist     | Add a song or playlist to a custom playlist                                                                               | /save-to-playlist 'playlistname' 'yt or spotify url'  |
| /remove-from-playlist | Remove a track from a custom playlist                                                                                     | /remove-from-playlist 'playlistname' 'track location' |
| /my-playlists         | Display your custom playlists                                                                                             | /my-playlists                                         |
| /display-playlist     | Display a custom playlist                                                                                                 | /display-playlist 'playlistname'                      |
| /delete-playlist      | remove a custom playlist                                                                                                  | /delete-playlist 'playlistname'                       |

## Gifs

| Command    | Description                | Usage      |
| ---------- | -------------------------- | ---------- |
| /gif       | Get a random gif           | /gif       |
| /jojo      | Get a random jojo gif      | /jojo      |
| /gintama   | Get a random gintama gif   | /gintama   |
| /anime     | Get a random anime gif     | /anime     |
| /baka      | Get a random baka gif      | /baka      |
| /cat       | Get a cute cat picture     | /cat       |
| /doggo     | Get a cute dog picture     | /doggo     |
| /hug       | Get a random hug gif       | /hug       |
| /slap      | Get a random slap gif      | /slap      |
| /pat       | Get a random pat gif       | /pat       |
| /triggered | Get a random triggered gif | /triggered |
| /amongus   | Get a random Among Us gif  | /amongus   |

## Other


| Command           | Description                                                                                                                                                        | Usage                                   |
| ----------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------ | --------------------------------------- |
| /fortune          | Get a fortune cookie tip                                                                                                                                           | /fortune                                |
| /insult           | Generate an evil insult                                                                                                                                            | /insult                                 |
| /chucknorris      | Get a satirical fact about Chuck Norris                                                                                                                            | /chucknorris                            |
| /motivation       | Get a random motivational quote                                                                                                                                    | /motivation                             |
| /random           | Generate a random number between two provided numbers                                                                                                              | /random 0 100                           |
| /8ball            | Get the answer to anything!                                                                                                                                        | /8ball Is this bot awesome?             |
| /rps              | Rock Paper Scissors                                                                                                                                                | /rps                                    |
| /bored            | Generate a random activity!                                                                                                                                        | /bored                                  |
| /advice           | Get some advice!                                                                                                                                                   | /advice                                 |
| /game-search      | Search for game information.                                                                                                                                       | /game-search super-metroid              |
| /kanye            | Get a random Kanye quote                                                                                                                                           | /kanye                                  |
| /world-news       | Latest headlines from reuters, you can change the news source to whatever news source you want, just change the source in line 13 in world-news.js or ynet-news.js | /world-news                             |
| /translate        | Translate to any language using Google translate.(only supported languages)                                                                                        | /translate english ありがとう           |
| /about            | Info about me and the repo                                                                                                                                         | /about                                  |
| /urban dictionary | Get definitions from urban dictionary                                                                                                                              | /urban javascript                       |
| /activity         | Generate an invite link to your voice channel's activity                                                                                                           | /activity voicechannel Chill            |
| /twitch-status    | Check the status of a Twitch steamer                                                                                                                               | /twitch-status streamer: bacon_fixation |

## Resources

[Getting a Tenor API key](https://tenor.com/developer/keyregistration)

[Getting a NewsAPI API key](https://newsapi.org/)

[Getting a Genius API key](https://genius.com/api-clients/new)

[Getting a rawg API key](https://rawg.io/apidocs)

[Getting a Twitch API key](https://github.com/Bacon-Fixation/Master-Bot/wiki/Getting-Your-Twitch-API-Info)

[Installing Node.js on Debian](https://www.digitalocean.com/community/tutorials/how-to-set-up-a-node-js-application-for-production-on-debian-9)

[Installing Node.js on Windows](https://treehouse.github.io/installation-guides/windows/node-windows.html)

[Installing on a Raspberry Pi](https://github.com/galnir/Master-Bot/wiki/Running-the-bot-on-a-Raspberry-Pi)

[Running Master-Bot on Docker](https://github.com/Bacon-Fixation/Master-Bot/wiki/Running-Master-Bot-with-Docker)

[Using a Repl.it LavaLink server](https://github.com/galnir/Master-Bot/wiki/Setting-Up-LavaLink-with-a-Replit-server)

[Using a public LavaLink server](https://github.com/galnir/Master-Bot/wiki/Setting-Up-LavaLink-with-a-public-LavaLink-Server)

[Using an Internal LavaLink server](https://github.com/galnir/Master-Bot/wiki/Setting-up-LavaLink-with-an-Internal-LavaLink-server)

## Contributing

Fork it and submit a pull request!
Anyone is welcome to suggest new features and improve code quality!

## Contributors ❤️

[Bacon Fixation](https://github.com/Bacon-Fixation) - music controls (buttons), 'connect4', 'tic-tac-toe', 'game-search', 'google-translate', 'speedrun' commands, 'invite', 'vote', 'poll', 'welcome', 'mute', 'unmute', 'twitchstatus', 'twitch-announcer', 'welcome-message', 'tv-show-search', pi instructions and visual updates

[ModoSN](https://github.com/ModoSN) - 'resolve-ip', 'rps', '8ball', 'bored', 'trump', 'advice', 'kanye', 'urban dictionary' commands and visual updates

[PhantomNimbi](https://github.com/PhantomNimbi) - bring back gif commands, lavalink config tweaks

[Natemo6348](https://github.com/Natemo6348) - 'mute', 'unmute'

[kfirmeg](https://github.com/kfirmeg) - play command flags, dockerization, docker wiki

[rafaeldamasceno](https://github.com/rafaeldamasceno) - 'music-trivia' and Dockerfile improvements, minor tweaks

[navidmafi](https://github.com/navidmafi) - 'LeaveTimeOut' and 'MaxResponseTime' options, update issue template, fix leave command

[Kyoyo](https://github.com/NotKyoyo) - added back 'now-playing'

[MontejoJorge](https://github.com/MontejoJorge) - added back 'remind'

[malokdev](https://github.com/malokdev) - 'uptime' command

[chimaerra](https://github.com/chimaerra) - minor command tweaks
