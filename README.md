# A discord bot made with JavaScript and the discord.js-commando library

[![forthebadge](https://forthebadge.com/images/badges/made-with-javascript.svg)](https://forthebadge.com)

Please drop a ⭐ if you find this repo/bot useful :)

### Installing the dependencies

`npm i`

### Usage

Make a config.json file in the root directory of the project and add:

```
{
  "prefix": "!",  // You can change the prefix to whatever you want it doesn't have to be - !
  "token": "Your-Bot-Token",
  "tenorAPI": "tenor-API-key",
  "newsAPI": "news-api-key",
  "youtubeAPI": "youtube-api-key",
  "yandexAPI": 'yandex-api-key"
}
```

I run the bot on a debian 9 environment so it might not work as intended on other operating systems, if you need a guide on how to install node.js on debian 9 or ubuntu I will link one in the resources down below. Moreover, the music command is still under development, so it might break.

Also, no matter what operating system you have, make sure [ffmpeg](https://www.ffmpeg.org/download.html) and [python 2.7](https://www.python.org/downloads/) are installed.

### Commands

- Music commands:

!play - the bot joins your channel and plays music from youtube, either add a url after '!play' or a song name and choose from the provided list

```
!play Darude - Sandstorm
!play https://www.youtube.com/watch?v=y6120QOlsfU
```

!pause

!resume

!skip

- Gif commands:

!gif - query a gif

```
!gif labrador
```

!animegif - random anime gif

!gintama - random gintama gif

!jojo - random jojo gif

!cat

- News command:

!global-news - latest headlines from reuters, you can change the news source to [whatever news source you want](https://newsapi.org/sources), just change the source in line 13 in global-news.js or ynet-news.js

- Translate command:

!translate 'your-text-here' - You can translate any text from any language to English(more languages will be added)

- Reddit command:

!reddit 'subreddit-name' - Get the 5 top posts of any non-nsfw subreddit or leave blank for r/all

- Random number command:

!random min max

### Resources

[Get a Tenor API key here](https://tenor.com/developer/keyregistration)

[Get a NewsAPI API key here](https://newsapi.org/)

[How to get a Youtube API key](https://developers.google.com/youtube/v3/getting-started)

[Get a Yandex API key here](https://translate.yandex.com/developers/keys)

[Installing node.js on debian](https://www.digitalocean.com/community/tutorials/how-to-set-up-a-node-js-application-for-production-on-debian-9)

- Other commands:

You also have other commands like kick, ban, fortune cookie, etc..

### Contributing

Fork it and submit a pull request!
Anyone is welcome to suggest new features and improve code quality!

### Tasks

- [ ] Improve code quality
- [ ] Write more guild commands
- [ ] Improve music quality
