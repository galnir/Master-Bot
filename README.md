# A Discord Music Bot written in JavaScript using the discord.js v13 library

[![image](https://img.shields.io/badge/language-javascript-yellow)](https://www.javascript.com/)
[![image](https://img.shields.io/badge/node-%3E%3D%2016.0.0-blue)](https://nodejs.org/)

## System dependencies

- [Node.js LTS or latest](https://nodejs.org/en/download/)
- [Java 13](https://www.azul.com/downloads/?package=jdk#download-openjdk) (other versions have some issues with Lavalink)

### Installing the Node.js dependencies

After cloning the repository, navigate to the project's folder and run the command `npm i` to install all Node.js module dependencies.

## Setup

### Method 1 - Using an Internal LavaLink Server

To set up the bot using this method, read these instructuiions: [guides/Lavalink-internal](./guides/Lavalink-internal.md)

### Method 2 - Using a Repl.it LavaLink Server

To set up the bot using this method, read these instructuiions: [guides/Lavalink-replit](./guides/Lavalink-replit.md)

## Commands

### Music

| Command               | Description                                                                                                               | Usage                                                             |
| --------------------- | ------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------- |
| /play                 | Play any song or playlist from youtube, you can do it by searching for a song by name or song url or playlist url         | /play darude sandstorm                                            |
| /pause                | Pause the current playing song                                                                                            | /pause                                                            |
| /resume               | Resume the current paused song                                                                                            | /resume                                                           |
| /leave                | Leaves voice channel if in one                                                                                            | /leave                                                            |
| /remove               | Remove a specific song from queue by its number in queue                                                                  | /remove 4                                                         |
| /queue                | Display the song queue                                                                                                    | /queue                                                            |
| /shuffle              | Shuffle the song queue                                                                                                    | /shuffle                                                          |
| /skip                 | Skip the current playing song                                                                                             | /skip                                                             |
| /skipall              | Skip all songs in queue                                                                                                   | /skipall                                                          |
| /skipto               | Skip to a specific song in the queue, provide the song number as an argument                                              | /skipto 5                                                         |
| /volume               | Adjust song volume                                                                                                        | /volume 80                                                        |
| /music-trivia         | Engage in a music trivia with your friends. You can add more songs to the trivia pool in resources/music/musictrivia.json | /music-trivia                                                     |
| /loop                 | Loop the currently playing song or queue                                                                                           | /loop                                                           |                                                   |
| /lyrics               | Get lyrics of any song or the lyrics of the currently playing song                                                        | /lyrics song-name                                                 |
| /now-playing          | Display the current playing song with a playback bar                                                                      | /now-playing                                                      |
| /move                 | Move song to a desired position in queue                                                                                  | /move 8 1                                                         |
| /queue-history              | Display the queue history                                                                                                 | /queue-history                                                          |

### Other

| Command           | Description                                                                                                                                                        | Usage                                                                        |
| ----------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ---------------------------------------------------------------------------- |
| /gif              | Get a random gif                                                                                                                                             | /gif                                                                         |
| /jojo              | Get a random jojo gif                                                                                                                                             | /jojo                                                                         |
| /gintama              | Get a random gintama gif                                                                                                                                             | /gintama                                                                         |
| /anime              | Get a random anime gif                                                                                                                                             | /anime                                                                         |
| /baka              | Get a random baka gif                                                                                                                                             | /baka                                                                         |
| /dog              | Get a cute dog picture                                                                                                                                             | /dog                                                                         |
| /fortune          | Get a fortune cookie tip                                                                                                                                           | /fortune                                                                     |
| /insult           | Generate an evil insult                                                                                                                                            | /insult                                                                      |
| /chucknorris      | Get a satirical fact about Chuck Norris                                                                                                                            | /chucknorris                                                                 |
| /motivation       | Get a random motivational quote                                                                                                                                    | /motivation                                                                  |
| /world-news       | Latest headlines from reuters, you can change the news source to whatever news source you want, just change the source in line 13 in world-news.js or ynet-news.js | /world-news                                                                  |
| /random           | Generate a random number between two provided numbers                                                                                                              | /random 0 100                                                                |                                                       |                                                    
| /translate        | Translate to any language using Google translate.(only supported languages)                                                                                        | /translate english ありがとう                                                |
| /about            | Info about me and the repo                                                                                                                                         | /about                                                                       |
| /8ball            | Get the answer to anything!                                                                                                                                        | /8ball Is this bot awesome?                                                  |
| /rps              | Rock Paper Scissors                                                                                                                                                | /rps                                                                         |
| /bored            | Generate a random activity!                                                                                                                                        | /bored                                                                       |
| /advice           | Get some advice!                                                                                                                                                   | /advice                                                                      |
| /kanye            | Get a random Kanye quote                                                                                                                                           | /kanye                                                                       |
| /urban dictionary | Get definitions from urban dictionary                                                                                                                              | /urban javascript                                                            |

## Resources

[Getting a Tenor API key](https://tenor.com/developer/keyregistration)

[Getting a NewsAPI API key](https://newsapi.org/)

[Getting a Genius API key](https://genius.com/api-clients/new)

[Getting a rawg API key](https://rawg.io/apidocs)

[Installing Node.js on Debian](https://www.digitalocean.com/community/tutorials/how-to-set-up-a-node-js-application-for-production-on-debian-9)

[Installing Node.js on Windows](https://treehouse.github.io/installation-guides/windows/node-windows.html)

[Installing on a Raspberry Pi](https://github.com/galnir/Master-Bot/wiki/Running-the-bot-on-a-Raspberry-Pi)

## Contributing

Fork it and submit a pull request!
Anyone is welcome to suggest new features and improve code quality!

## Contributors ❤️

[Bacon Fixation](https://github.com/Bacon-Fixation) - 'connect4', 'tic-tac-toe', 'game-search', 'google-translate', 'speedrun' commands, 'invite', 'vote', 'poll', 'welcome', 'mute', 'unmute', 'twitchstatus', 'twitch-announcer', 'welcome-message', 'tv-show-search', pi instructions and visual updates

[ModoSN](https://github.com/ModoSN) - 'resolve-ip', 'rps', '8ball', 'bored', 'trump', 'advice', 'kanye', 'urban dictionary' commands and visual updates

[Natemo6348](https://github.com/Natemo6348) - 'mute', 'unmute'

[kfirmeg](https://github.com/kfirmeg) - play command flags, dockerization, docker wiki

[rafaeldamasceno](https://github.com/rafaeldamasceno) - 'music-trivia' and Dockerfile improvements, minor tweaks

[navidmafi](https://github.com/navidmafi) - 'LeaveTimeOut' and 'MaxResponseTime' options, update issue template, fix leave command

[Kyoyo](https://github.com/NotKyoyo) - added back 'now-playing'

[MontejoJorge](https://github.com/MontejoJorge) - added back 'remind'

[malokdev](https://github.com/malokdev) - 'uptime' command

[chimaerra](https://github.com/chimaerra) - minor command tweaks
