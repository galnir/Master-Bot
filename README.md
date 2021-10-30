# A Discord Music Bot written in JavaScript and the discord.js v13 library

[![image](https://img.shields.io/badge/language-javascript-yellow)](https://www.javascript.com/)
[![image](https://img.shields.io/badge/node-%3E%3D%2016.0.0-blue)](https://nodejs.org/)

## 🚧 The bot is transitioning from discord.js v12 to v13 so you may encounter bugs 🚧

## System dependencies

For the bot to run, your system needs to have Node.js v16 atleast and Python 3 (for compiling some Node.js module dependencies) installed.
A MongoDB database is also needed. I recommend using the free tier of MongoDB Atlas, you can get started using this [guide](https://docs.atlas.mongodb.com/getting-started/). Make sure to generate a valid URI and place it in the config.json file.

### Installing the Node.js dependencies

After cloning the repository, navigate to the project's folder and run the command `npm ci --production` to install all Node.js module dependencies.

## Setup

Create a `config.json` file in the root directory of the project with the following contents:

### Minimum settings

This is the minimum amount of settings that need to be set for the core part (music) of the bot to work.

```json
{
  "mongo_URI": "your-mongodb-uri",
  "client_id": "the-bots-discord-id",
  "token": "Your-Bot-Token"
}
```

### Full settings

For full command support, including lyrics, GIFs, news, Twitch integration, and others, all of the following settings need to be added. You can also choose to add only the ones for the functionalities you want.

```json
{
  "invite": "false",
  "geniusLyricsAPI": "genius-api-key",
  "tenorAPI": "tenor-API-key",
  "newsAPI": "news-api-key",
  "twitchClientID": "Your-Client-ID",
  "twitchClientSecret": "Your-Client-Secret",
  "rawgAPI": "rawg-api-key",
  "ownerID": "discord-user-id",
  "devID": "discord-user-id"
}
```

NOTE: When setting `"invite": true`, remember to enable the Public Bot option in the [Discord Developer Portal](https://discordapp.com/developers/applications/).

### Options

This is the default template for `options.json` file, in which you can configure certain aspects of the bot:

```json
{
  "playLiveStreams": true,
  "playVideosLongerThan1Hour": true,
  "maxQueueLength": 1000,
  "AutomaticallyShuffleYouTubePlaylists": false,
  "LeaveTimeOut": 90,
  "MaxResponseTime": 30,
  "deleteOldPlayMessage": false
}
```

What each option affects can be seen here in further detail:

- `playLiveStreams` (`true`, `false`): allows the bot to play live streams
- `playVideosLongerThan1Hour` (`true`, `false`): allows the bot to play videos longer than 1 hour
- `maxQueueLength` (`integer` greater than `1`) : maximum numbers of songs that can be in queue
- `AutomaticallyShuffleYouTubePlaylists` (`true`, `false`): automatically shuffle YouTube playlists
- `LeaveTimeOut` (`integer` between `1` and `600`): timeout in seconds before bot leaves channel due to inactivity
- `MaxResponseTime` (`integer` between `5` and `150`): amount of time, in seconds, when the user to is allowed to respond back to bot before it cancels the command (e.g. when using `!play song name`)
- `deleteOldPlayMessage` (`true`, `false`): makes the bot remove the play message after the song ends

## Commands

### Music

| Command               | Description                                                                                                               | Usage                                                             |
| --------------------- | ------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------- |
| !play                 | Play any song or playlist from youtube, you can do it by searching for a song by name or song url or playlist url         | !play darude sandstorm                                            |
| !create-playlist      | Create a saved playlist                                                                                                   | !create-playlist EDM                                              |
| !delete-playlist      | Delete a playlist from your saved playlists                                                                               | !delete-playlist EDM                                              |
| !display-playlist     | Display a saved playlist                                                                                                  | !display-playlist EDM                                             |
| !my-playlists         | List your saved playlists                                                                                                 | !my-playlists                                                     |
| !remove-from-playlist | Remove a song from a saved playlist using its index                                                                       | !remove-from-playlist EDM 5                                       |
| !save-to-playlist     | Save a song or a playlist to a saved playlist                                                                             | !save-to-playlist EDM https://www.youtube.com/watch?v=dQw4w9WgXcQ |
| !pause                | Pause the current playing song                                                                                            | !pause                                                            |
| !resume               | Resume the current paused song                                                                                            | !resume                                                           |
| !leave                | Leaves voice channel if in one                                                                                            | !leave                                                            |
| !remove               | Remove a specific song from queue by its number in queue                                                                  | !remove 4                                                         |
| !queue                | Display the song queue                                                                                                    | !queue                                                            |
| !shuffle              | Shuffle the song queue                                                                                                    | !shuffle                                                          |
| !skip                 | Skip the current playing song                                                                                             | !skip                                                             |
| !skipall              | Skip all songs in queue                                                                                                   | !skipall                                                          |
| !skipto               | Skip to a specific song in the queue, provide the song number as an argument                                              | !skipto 5                                                         |
| !volume               | Adjust song volume                                                                                                        | !volume 80                                                        |
| !music-trivia         | Engage in a music trivia with your friends. You can add more songs to the trivia pool in resources/music/musictrivia.json | !music-trivia                                                     |
| !loop                 | Loop the currently playing song                                                                                           | !loop 5                                                           |
| !loopqueue            | Loop the queue                                                                                                            | !loopqueue 2                                                      |
| !lyrics               | Get lyrics of any song or the lyrics of the currently playing song                                                        | !lyrics song-name                                                 |
| !now-playing          | Display the current playing song with a playback bar                                                                      | !now-playing                                                      |
| !move                 | Move song to a desired position in queue                                                                                  | !move 8 1                                                         |
| !history              | Display the queue history                                                                                                 | !history                                                          |

### Other

| Command           | Description                                                                                                                                                        | Usage                                                                        |
| ----------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ---------------------------------------------------------------------------- |
| !cat              | Get a cute cat picture                                                                                                                                             | !cat                                                                         |
| !dog              | Get a cute dog picture                                                                                                                                             | !dog                                                                         |
| !fortune          | Get a fortune cookie tip                                                                                                                                           | !fortune                                                                     |
| !insult           | Generate an evil insult                                                                                                                                            | !insult                                                                      |
| !chucknorris      | Get a satirical fact about Chuck Norris                                                                                                                            | !chucknorris                                                                 |
| !motivation       | Get a random motivational quote                                                                                                                                    | !motivation                                                                  |
| !world-news       | Latest headlines from reuters, you can change the news source to whatever news source you want, just change the source in line 13 in world-news.js or ynet-news.js | !world-news                                                                  |
| !random           | Generate a random number between two provided numbers                                                                                                              | !random 0 100                                                                |
| !reddit           | Replies with 5 top non nsfw subreddit posts                                                                                                                        | !reddit askreddit                                                            |
| !say              | Make the bot say anything                                                                                                                                          | !say Lorem Ipsum                                                             |
| !sr               | Replies with the Top 10 speedrun results in every category.                                                                                                        | !sr super metroid                                                            |
| !translate        | Translate to any language using Google translate.(only supported languages)                                                                                        | !translate english ありがとう                                                |
| !about            | Info about me and the repo                                                                                                                                         | !about                                                                       |
| !8ball            | Get the answer to anything!                                                                                                                                        | !8ball Is this bot awesome?                                                  |
| !rps              | Rock Paper Scissors                                                                                                                                                | !rps                                                                         |
| !bored            | Generate a random activity!                                                                                                                                        | !bored                                                                       |
| !advice           | Get some advice!                                                                                                                                                   | !advice                                                                      |
| !kanye            | Get a random Kanye quote                                                                                                                                           | !kanye                                                                       |
| !urban dictionary | Get definitions from urban dictionary                                                                                                                              | !urban javascript                                                            |
| !poll             | Creates a poll with up to 10 choices.                                                                                                                              | !poll "What's your favorite food?" "Hot Dogs,Pizza,Burgers,Fruits,Veggie" 10 |
| !vote             | Starts a yes/no/don't care vote.                                                                                                                                   | !vote "Do you like to vote?." "I mean who doesn't right?!" 5                 |
| !twitchstatus     | A quick check to see if a streamer is currently online. or to give a shout-out a fellow streamer                                                                   | !twitchstatus MasterBot or !tso MasterBot                                    |
| !tv-show-search   | Search for Tv shows with a keyword                                                                                                                                 | !tv-show-search Duck                                                         |
| !nickname         | Sets the selected member's nickname with the provided nickname                                                                                                     | !nickname @Master-Bot Master                                                 |
| !game-search      | Search for game information                                                                                                                                        | !game-search super metroid                                                   |
| !connect4         | Play a game of Connect 4 against another player.                                                                                                                   | !connect4 @janedoe                                                           |
| !tic-tac-toe      | Play a game of Tic Tac Toe against another player.                                                                                                                 | !tic-tac-toe @janedoe                                                        |

### GIFs

| Command   | Description                         | Usage                   |
| --------- | ----------------------------------- | ----------------------- |
| !animegif | Get an anime related gif by a query | !animegif one punch man |
| !gif      | Get any gif by a query              | !gif labrador           |
| !gintama  | Replies with a random gintama gif   | !gintama                |
| !jojo     | Replies with a random jojo gif      | !jojo                   |

### Guild

| Command                    | Description                                                                    | Usage                                |
| -------------------------- | ------------------------------------------------------------------------------ | ------------------------------------ |
| !ban                       | Bans a tagged member                                                           | !ban @johndoe                        |
| !invite                    | Replies with a link to invite the bot.                                         | !invite                              |
| !kick                      | Kicks a tagged member                                                          | !kick @johndoe                       |
| !prune                     | Delete up to 99 recent messages                                                | !prune 50                            |
| !welcome-message           | Allows you to toggle the welcome message for new members that join the server. | !welcome-message enable              |
| !twitch-announcer          | Allows you to Enable, Disable or Check the Twitch Announcer.                   | !ta enable                           |
| !twitch-announcer-settings | Settings for the Twitch Announcer.                                             | !tasettings Bacon_Fixation general 1 |
| !add-role                  | Adds a specific role to a specified user.                                      | !add-role @johndoe admin             |
| !remove-role               | Removes a specific role from a specified user.                                 | !remove-role @johndoe admin          |

## Resources

[Getting a Tenor API key](https://tenor.com/developer/keyregistration)

[Getting a NewsAPI API key](https://newsapi.org/)

[Getting a Genius API key](https://genius.com/api-clients/new)

[Getting a Twitch API key](https://github.com/Bacon-Fixation/Master-Bot/wiki/Getting-Your-Twitch-API-Info)

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

[meiaihara06](https://github.com/meiaihara06) - 'LeaveTimeOut' and 'MaxResponseTime' options

[Kyoyo](https://github.com/NotKyoyo) - added back 'now-playing'

[MontejoJorge](https://github.com/MontejoJorge) - added back 'remind'

[navidmafi](https://github.com/navidmafi) - update issue template, fix leave command

[malokdev](https://github.com/malokdev) - 'uptime' command

[chimaerra](https://github.com/chimaerra) - minor command tweaks
