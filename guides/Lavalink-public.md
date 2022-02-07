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

