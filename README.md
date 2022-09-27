# A Discord Music Bot written in TypeScript using Sapphire, discord.js, Next.js and React

[![image](https://img.shields.io/badge/language-typescript-blue)](https://www.typescriptlang.org)
[![image](https://img.shields.io/badge/node-%3E%3D%2016.0.0-blue)](https://nodejs.org/)

## System dependencies

- [Node.js LTS or latest](https://nodejs.org/en/download/)
- [Java 13](https://www.azul.com/downloads/?package=jdk#download-openjdk) (other versions have some issues with Lavalink)

## Setup bot

Create an [application.yml](https://github.com/freyacodes/lavalink/blob/master/LavalinkServer/application.yml.example) file root folder.

Download the latest Lavalink jar from [here](https://github.com/Cog-Creators/Lavalink-Jars/releases) and also place it in the root folder.

### PostgreSQL

#### Linux

Either from the official site or follow the tutorial for your [distro](https://www.digitalocean.com/community/tutorial_collections/how-to-install-and-use-postgresql).

#### MacOS

Get [brew](https://brew.sh), then enter 'brew install postgresql'.

#### Windows

Getting Postgres and Prisma to work together on Windows is not worth the hassle. Create an account on [heroku](https://dashboard.heroku.com/apps) and follow these steps:

1. Open the dashboard and click on 'New' > 'Create new app', give it a name and select the closest region to you then click on 'Create app'.
2. Go to 'Resources' tab, under 'Add-ons' search for 'Heroku Postgres' and select it. Click 'Submit Order Form' and then do the same step again (create another postgres instance).
3. Click on each 'Heroku Postgres' addon you created, go to 'Settings' tab > Database Credentials > View Credentials and copy the each one's URI to either `DATABASE_URL` or `SHADOW_DB_URL` in the .env file you will be creating in the settings section.
4. Done!

### Redis

#### MacOS
`brew install redis`.

#### Windows
Download from [here](https://redis.io/download/).

#### Linux
Follow the instructions [here](https://redis.io/docs/getting-started/installation/install-redis-on-linux/).

### Settings (env)

Create a `.env` file in the root directory and copy the contents of .env.example to it.
Note: if you are not hosting postgres on Heroku you do not need the SHADOW_DB_URL variable.

```env
# DB URL
DATABASE_URL="postgresql://john:doe@localhost:5432/master-bot?schema=public"
SHADOW_DB_URL="postgresql://john:doe@localhost:5432/master-bot?schema=public"

# Bot Token
DISCORD_TOKEN=""

# Next Auth

NEXTAUTH_SECRET="somesupersecrettwelvelengthword"
NEXTAUTH_URL=http://domian:3000
NEXTAUTH_URL_INTERNAL=http://localhost:3000
NEXT_PUBLIC_INVITE_URL="https://discord.com/api/oauth2/authorize?client_id=yourclientid&permissions=8&scope=identify+guilds+email+applications.commands.permissions.update"

# Next Auth Discord Provider
DISCORD_CLIENT_ID=""
DISCORD_CLIENT_SECRET=""

# Lavalink
LAVA_HOST="0.0.0.0"
LAVA_PASS="youshallnotpass"
LAVA_PORT=2333
LAVA_SECURE=false

# Spotify
SPOTIFY_CLIENT_ID=""
SPOTIFY_CLIENT_SECRET=""

# Twitch
TWITCH_CLIENT_ID=""
TWITCH_CLIENT_SECRET=""

# Other APIs
TENOR_API=""
NEWS_API=""
GENIUS_API=""
RAWG_API=""

```
#### Gif features
If you have no use in the gif commands, leave everything under 'Other APIs' empty. Same applies for Twitch, everything else is needed.

#### DB URL
Change 'john' to your pc username and 'doe' to some password, or set the name and password you created when you installed Postgres.

#### Bot Token
Generate a token in your Discord developer portal.

#### Next Auth
You can leave everything as is, just change 'yourclientid' in NEXT_PUBLIC_INVITE_URL to your Discord bot id and then change 'domain' in NEXTAUTH_URL to your domain or public ip. You can find your public ip by going to [www.whatismyip.com](https://www.whatismyip.com/).

#### Next Auth Discord Provider
Go to the OAuth2 tab in the developer portal, copy the Client ID to DISCORD_CLIENT_ID and generate a secret to place in DISCORD_CLIENT_SECRET. Also, set the following URLs under 'Redirects':

 * http://localhost:3000/api/auth/callback/discord
 * http://domain:3000/api/auth/callback/discord

Make sure to change 'domain' in http://domain:3000/api/auth/callback/discord to your domain or public ip.

#### Lavalink
You can leave this as long as the values match your application.yml.

#### Spotify and Twitch
Create an application in each platform's developer portal and paste the relevant values.

# Running the bot
1. If you followed everything right, hit `npm i` in the root folder. When it finishes make sure prisma didn't error.
2. Open a separate terminal in the root folder and run 'java -jar Lavalink.jar'.
3. Wait a few seconds and hit `npm run dev`.
4. If everything works, your bot and dashboard should be running.
5. Enjoy!

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

[Using a Repl.it LavaLink server](https://github.com/galnir/Master-Bot/wiki/Setting-Up-LavaLink-with-a-Replit-server)

[Using a public LavaLink server](https://github.com/galnir/Master-Bot/wiki/Setting-Up-LavaLink-with-a-public-LavaLink-Server)

[Using an Internal LavaLink server](https://github.com/galnir/Master-Bot/wiki/Setting-up-LavaLink-with-an-Internal-LavaLink-server)

## Contributing

Fork it and submit a pull request!
Anyone is welcome to suggest new features and improve code quality!

## Contributors ❤️


**⭐ [Bacon Fixation](https://github.com/Bacon-Fixation) ⭐ - Countless contributions**


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
