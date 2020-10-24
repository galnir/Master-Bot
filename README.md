# A Discord Music Bot written in JavaScript, the discord.js library and discord.js-commando framework

[![forthebadge](https://forthebadge.com/images/badges/made-with-javascript.svg)](https://forthebadge.com)

### Installing the dependencies

`npm i`

### Setup

Make a config.json file in the root directory of the project and add:

```
{
  "prefix": "!",
  "discord_owner_id": "Your-Discord-ID",
  "token": "Your-Bot-Token",
  "tenorAPI": "tenor-API-key",
  "newsAPI": "news-api-key",
  "youtubeAPI": "youtube-api-key",
  "yandexAPI": "yandex-api-key",
  "geniusLyricsAPI": "genius-api-key"
}
```

I run the bot on a debian 9 environment so it might not work as intended on other operating systems(although it should), if you need a guide on how to install node.js on debian 9 or ubuntu I will link one in the resources down below.

Also, no matter what operating system you have, make sure [ffmpeg](https://www.ffmpeg.org/download.html) and [python 2.7](https://www.python.org/downloads/) are installed. **Discord.js now requires Node version greater than or equal to 12.0.0** .

If you are not cloning this repo, make sure your dependencies versions are the same as this repo's.

### Commands

- Music

| Command       | Description                                                                                                               | Usage                  |
| ------------- | ------------------------------------------------------------------------------------------------------------------------- | ---------------------- |
| !leave        | Leaves voice channel if in one                                                                                            | !leave                 |
| !loop         | Loop the currently playing song                                                                                           | !loop 5                |
| !loopqueue    | Loop the queue                                                                                                            | !loopqueue 2           |
| !lyrics       | Get lyrics of any song or the lyrics of the currently playing song                                                        | !lyrics song-name      |
| !move         | Move song to a desired position in queue                                                                                  | !move 8 1              |
| !music-trivia | Engage in a music trivia with your friends. You can add more songs to the trivia pool in resources/music/musictrivia.json | !music-trivia          |
| !now-playing  | Display the current playing song with a playback bar                                                                      | !now-playing           |
| !pause        | Pause the current playing song                                                                                            | !pause                 |
| !play         | Play any song or playlist from youtube, you can do it by searching for a song by name or song url or playlist url         | !play darude sandstorm |
| !queue        | Display the song queue                                                                                                    | !queue                 |
| !remove       | Remove a specific song from queue by its number in queue                                                                  | !remove 4              |
| !resume       | Resume the current paused song                                                                                            | !resume                |
| !shuffle      | Shuffle the song queue                                                                                                    | !shuffle               |
| !skip         | Skip the current playing song                                                                                             | !skip                  |
| !skipall      | Skip all songs in queue                                                                                                   | !skipall               |
| !skipto       | Skip to a specific song in the queue, provide the song number as an argument                                              | !skipto 5              |
| !volume       | Adjust song volume                                                                                                        | !volume 80             |

- Misc

| Command       | Description                                                                                                               | Usage                  |
| ------------- | ------------------------------------------------------------ | ---------------- |
| !cat          | Get a cute cat picture                                       | !cat             |
| !chucknorris  | Get a satirical fact about Chuck Norris                      | !chucknorris     |
| !dog          | Get a cute dog picture                                       | !dog             |
| !fortune      | Get a fortune cookie tip                                     | !fortune         |
| !global-news  | Get the latest headlines                                     | !global-news     |
| !insult       | Generate an evil insult                                      | !insult          |
| !motivation   | Get a random motivational quote                              | !motivation      |
| !random       | Generate a random number between the two provided.           | !random 1 5      |
| !reddit       | Replies with 5 top non nsfw subreddit posts                  | !reddit memes    |
| !say          | Make the bot say anything                                    | !say hello       |
| !translate    | Translate to any language using yandex translation service   | !translate hola  |
| !uptime       | Replies with the bot's total uptime                          | !uptime          |
| !whomademe    | Info about me and the repo                                   | !whomademe       |

- Gifs

| Command   | Description                         | Usage                   |
| --------- | ----------------------------------- | ----------------------- |
| !animegif | Get an anime related gif by a query | !animegif one punch man |
| !gif      | Get any gif by a query              | !gif labrador           |
| !gintama  | Replies with a random gintama gif   | !gintama                |
| !jojo     | Replies with a random jojo gif       | !jojo                   |

- Guild

| Command               | Description                     | Usage                                 |
| --------------------- | ------------------------------- | ------------------------------------- |
| !ban                  | Bans a tagged member            | !ban @johndoe                         |
| !kick                 | Kicks a tagged member           | !kick @johndoe                        |
| !prune                | Delete up to 99 recent messages | !prune 50                             |

### Resources
* [Get your user if here] (https://support.discord.com/hc/en-us/articles/206346498-Where-can-I-find-my-User-Server-Message-ID-)
* [Get a Tenor API key here](https://tenor.com/developer/keyregistration)
* [Get a NewsAPI API key here](https://newsapi.org/)
* [How to get a Youtube API key](https://developers.google.com/youtube/v3/getting-started)
* [Get a Yandex API key here](https://translate.yandex.com/developers/keys)
* [Get a Genius API key here](https://genius.com/api-clients/new)
* [Installing node.js on debian](https://www.digitalocean.com/community/tutorials/how-to-set-up-a-node-js-application-for-production-on-debian-9)
* [Installing node.js on Windows](https://treehouse.github.io/installation-guides/windows/node-windows.html)

### Contributing

Fork it and submit a pull request!
Anyone is welcome to suggest new features and improve code quality!

### Tasks

* Feature: Saved queues (Being worked on)
* Command: Warnings
* Command: Mute user

## Contributors

* [malokdev](https://github.com/malokdev) - uptime command
* [chimaerra](https://github.com/chimaerra) - minor command tweaks
* [ModoSN](https://github.com/ModoSN) - resolve ip command
