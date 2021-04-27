# A Discord Music Bot written in JavaScript, the discord.js library and discord.js-commando framework

[![image](https://img.shields.io/badge/language-javascript-yellow)](https://www.javascript.com/)
[![image](https://img.shields.io/badge/node-%3E%3D%2014.0.0-blue)](https://nodejs.org/)

### Installing the dependencies

`npm i`

### Setup

Make a config.json file in the root directory of the project and add:

- Minimum

```
{
  "prefix": "!",
  "discord_owner_id": "Your-Discord-ID",
  "token": "Your-Bot-Token",
  "youtubeAPI": "youtube-api-key"
}
```

- Full Command List

```
{
  "invite": "false",
  "prefix": "!",
  "discord_owner_id": "Your-Discord-ID",
  "token": "Your-Bot-Token",
  "youtubeAPI": "youtube-api-key",
  "geniusLyricsAPI": "genius-api-key",
  "tenorAPI": "tenor-API-key",
  "newsAPI": "news-api-key",
  "twitchClientID": "Your-Client-ID",
  "twitchClientSecret": "Your-Client-Secret"
}
```

Note: When setting `"invite": true` remember to enable the Public Bot option in the [Discord Developer Portal](https://discordapp.com/developers/applications/)

I run the bot on a debian 9 environment so it might not work as intended on other operating systems(although it should), if you need a guide on how to install node.js on debian 9 or ubuntu I will link one in the resources down below.

Also, no matter what operating system you have, make sure [python 2.7](https://www.python.org/downloads/) is installed. **Make sure that your Node.js version is v14 at least.** .

If you are not cloning this repo, make sure your dependencies versions are the same as this repo's.

### Options

Default Template for options.json

```
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

- playLiveStreams : Allow to play Live Streams (`true`,`false`)
- playVideosLongerThan1Hour : Allow to play videos longer than 1 hour (`true`,`false`)
- maxQueueLength : Maximum numbers of songs that can be in queue (`integer > 1`)
- AutomaticallyShuffleYouTubePlaylists : Automatic shuffle YouTube playlists : (`true`,`false`)
- LeaveTimeOut : Timeout in seconds before bot leaves channel due to inactivity.(`integer` between `1` and `600`)
- MaxResponseTime : Maximum time in seconds allowed for user to response back to bot before cancelling command (example: using !play song name) : (`integer` between `5` and `150`)
- deleteOldPlayMessage : Remove play message after playing or no : (`true`,`false`)

### Commands

- Music

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

- Other

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

- Gifs

| Command   | Description                         | Usage                   |
| --------- | ----------------------------------- | ----------------------- |
| !animegif | Get an anime related gif by a query | !animegif one punch man |
| !gif      | Get any gif by a query              | !gif labrador           |
| !gintama  | Replies with a random gintama gif   | !gintama                |
| !jojo     | Replies with a random jojo gif      | !jojo                   |

- Guild

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

### Resources

[Get a Tenor API key here](https://tenor.com/developer/keyregistration)

[Get a NewsAPI API key here](https://newsapi.org/)

[How to get a Youtube API key](https://developers.google.com/youtube/v3/getting-started)

[Get a Genius API key here](https://genius.com/api-clients/new)

[How to get a Twitch API Key](https://github.com/Bacon-Fixation/Master-Bot/wiki/Getting-Your-Twitch-API-Info)

[Installing node.js on debian](https://www.digitalocean.com/community/tutorials/how-to-set-up-a-node-js-application-for-production-on-debian-9)

[Installing node.js on Windows](https://treehouse.github.io/installation-guides/windows/node-windows.html)

[Installing on a Raspberry Pi](https://github.com/galnir/Master-Bot/wiki/Running-the-bot-on-a-Raspberry-Pi)

### Contributing

Fork it and submit a pull request!
Anyone is welcome to suggest new features and improve code quality!

## Contributors ❤️

[Bacon Fixation](https://github.com/Bacon-Fixation) - 'speedrun' commands, 'invite', 'vote', 'poll', 'welcome', 'mute', 'unmute', 'twitchstatus', 'twitch-announcer', 'welcome-message', 'tv-show-search', pi instructions and visual updates

[ModoSN](https://github.com/ModoSN) - 'resolve-ip', 'rps', '8ball', 'bored', 'trump', 'advice', 'kanye', 'urban dictionary' commands and visual updates

[Natemo6348](https://github.com/Natemo6348) - 'mute', 'unmute'

[malokdev](https://github.com/malokdev) - 'uptime' command

[chimaerra](https://github.com/chimaerra) - minor command tweaks
