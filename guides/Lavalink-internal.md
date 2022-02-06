# Setup

Create an [application.yml](https://github.com/freyacodes/Lavalink/blob/master/LavalinkServer/application.yml.example) in the root directory of the project and change the host address to `127.0.0.1`.

Download the latest Lavalink jar from [here](https://github.com/Cog-Creators/Lavalink-Jars/releases) and place it in the project's root directory (same directory as application.yml).

Open a separate terminal in the root directory and run `java -jar LavaLink.jar`

Create a `config.json` with the following fields:

## Minimal

```json
{
  "client_id": "discord-client-id",
  "token": "discord-bot-token",
  "lava_host": "127.0.0.1",
  "lava_pass": "youshallnotpass",
  "lava_port": 2333,
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
  "lava_host": "127.0.0.1",
  "lava_pass": "youshallnotpass",
  "lava_port": 2333,
  "lava_secure": false,
  "spotify_client_id": "client-d",
  "spotify_client_secret": "client-secret",
  "invite": "true",
  "geniusLyricsAPI": "api-key",
  "tenorAPI": "api-key",
  "newsAPI": "api-key",
  "rawgAPI": "api-key"
}
```
