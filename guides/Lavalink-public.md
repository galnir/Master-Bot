# Setup

Alternatively if you don't want to host your own LavaLinbk server you can just use the following config and run off of a free public instance of LavaLionk.

Create a **config.json** with the following fields *[Note: You can swap out the LavaLink info in the config with any of the servers listed on this page: [lavalink.darrennathanael.com](https://lavalink.darrennathanael.com/)]*:

## Minimal

```json
{
  "client_id": "discord-client-id",
  "token": "discord-bot-token",
  "lava_host": "lava.link",
  "lava_pass": "anything as password",
  "lava_port": 80,
  "lava_secure": false,
  "spotify_client_id": "client-id",
  "spotify_client_secret": "client-secret"
}
```

## Full

```json
{
  "client_id": "discord-client-id",
  "token": "discord-bot-token",
  "lava_host": "lava.link",
  "lava_pass": "anything as password",
  "lava_port": 80,
  "lava_secure": false,
  "spotify_client_id": "client-id",
  "spotify_client_secret": "client-secret",
  "invite": "true",
  "geniusLyricsAPI": "api-key",
  "tenorAPI": "api-key",
  "newsAPI": "api-key",
  "rawgAPI": "api-key"
}
```

## Resources

[Getting a Tenor API key](https://tenor.com/developer/keyregistration)

[Getting a NewsAPI API key](https://newsapi.org/)

[Getting a Genius API key](https://genius.com/api-clients/new)

[Getting a rawg API key](https://rawg.io/apidocs)

[Installing Node.js on Debian](https://www.digitalocean.com/community/tutorials/how-to-set-up-a-node-js-application-for-production-on-debian-9)

[Installing Node.js on Windows](https://treehouse.github.io/installation-guides/windows/node-windows.html)

[Installing on a Raspberry Pi](https://github.com/galnir/Master-Bot/wiki/Running-the-bot-on-a-Raspberry-Pi)
