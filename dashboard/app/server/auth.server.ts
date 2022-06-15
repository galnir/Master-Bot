import { json } from "@remix-run/node";
import { Authenticator } from "remix-auth";
import { DiscordStrategy } from "remix-auth-socials";
import { sessionStorage } from "./session.server";

if (!process.env.DISCORD_CLIENT_ID) {
  throw new Error("DISCORD_CLIENT_ID must be set");
}

if (!process.env.DISCORD_CLIENT_SECRET) {
  throw new Error("DISCORD_CLIENT_SECRET must be set");
}

export let authenticator = new Authenticator(sessionStorage, {
  sessionKey: "master_bot_dashboard_session",
});

authenticator.use(
  new DiscordStrategy(
    {
      clientID: process.env.DISCORD_CLIENT_ID,
      clientSecret: process.env.DISCORD_CLIENT_SECRET,
      callbackURL: `http://localhost:3000/auth/discord/callback`,
    },
    async ({ profile }) => {
      const userInDB = await fetch(
        `http://localhost:1212/user?id=${profile.id}`
      );
      return json(userInDB);
    }
  )
);
