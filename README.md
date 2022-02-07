# A Discord Music Bot written in JavaScript using the discord.js v13 library

[![image](https://img.shields.io/badge/language-javascript-yellow)](https://www.javascript.com/)
[![image](https://img.shields.io/badge/node-%3E%3D%2016.0.0-blue)](https://nodejs.org/)

## System dependencies

- [Node.js LTS or latest](https://nodejs.org/en/download/)
- [Java 13](https://www.azul.com/downloads/?package=jdk#download-openjdk) (other versions have some issues with Lavalink)


## Resources

[Installing Node.js on Debian](https://www.digitalocean.com/community/tutorials/how-to-set-up-a-node-js-application-for-production-on-debian-9)

[Installing Node.js on Windows](https://treehouse.github.io/installation-guides/windows/node-windows.html)

[Installing on a Raspberry Pi](https://github.com/galnir/Master-Bot/wiki/Running-the-bot-on-a-Raspberry-Pi)

## Installation

Type the following commands in terminal or command prompt to clone the repository and install all of the dependencies:

```sh
$ git clone https://github.com/galnir/Master-Bot.git
$ cd Master-Bot
$ npm i
```

## Setup

#### Method 1 - Using an Internal LavaLink Server

To set up the bot using this method, follow this guide: [Internal LavaLink - Setup Guide](./guides/Lavalink-internal.md)

#### Method 2 - Using a Repl.it LavaLink Server

To set up the bot using this method, follow this guide: [Repl.it LavaLink - Setup Guide](./guides/Lavalink-replit.md)

#### Method 3 - Using a public LavaLink Server

To set up the bot using this method, follow this guide: [Public LavaLink - Setup Guide](./guides/Lavalink-public.md)

## Running the bot

Once you have finished with all of the steps above you are ready to run the bot

To run the bot in production mode type:

```sh
$ npm run start
```

To run the bot in debugging mode type:
```sh
$ npm run dev
```

## Commands

A list of commands can be found [here](commands.md).

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
