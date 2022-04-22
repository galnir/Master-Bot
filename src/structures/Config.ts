interface BotConfig {
  client_id: string;
  discord_owner_id: string;
  token: string;
  tenorAPI?: string | undefined;
  newsAPI?: string | undefined;
  geniusLyricsAPI: string;
  twitchClientID?: string | undefined;
  twitchClientSecret?: string;
  rawgAPI?: string | undefined;
  lava_host: string;
  lava_pass: string;
  lava_port: number;
  lava_secure: boolean;
  invite_url: string;
  spotify_client_id: string;
  spotify_client_secret: string;
}
