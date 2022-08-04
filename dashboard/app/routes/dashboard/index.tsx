import type { LoaderFunction } from "@remix-run/node";
import { json } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { authenticator } from "~/server/auth.server";
import type { DiscordProfile } from "~/lib/discord-api-fetcher";
import GuildSelectBox from "~/components/GuildSelectBox";
import type { Guild } from "~/api-types";

type LoaderData = {
  user: DiscordProfile;
  databaseGuilds: Guild[] | null;
  invite_url: string;
};

export let loader: LoaderFunction = async ({ request, params }) => {
  const user = (await authenticator.isAuthenticated(request, {
    failureRedirect: "/login",
  })) as DiscordProfile;

  const response = await fetch(
    `http://localhost:1212/guilds?ownerId=${user.id}`
  );
  const databaseGuilds: Guild[] | null = await response.json();

  const invite_url = process.env.Invite_URL;

  return json({ user, databaseGuilds, invite_url });
};

export default function DashboardIndex() {
  const { user, databaseGuilds, invite_url } = useLoaderData<LoaderData>();
  const { guilds } = user;
  if (!guilds || !databaseGuilds) {
    return (
      <div>
        <h1>You can only manage the bot if you are guild owner</h1>
      </div>
    );
  }

  return (
    <div className="px-40 py-24 text-white content-center w-full">
      <h1 className="text-4xl font-semibold">Select a guild to manage</h1>
      <div className="flex gap-10 grow">
        {guilds.map((guild) => {
          const isBotInGuild = databaseGuilds?.some(
            (databaseGuild) => databaseGuild.id === guild.id
          );
          return (
            <GuildSelectBox
              key={guild.id}
              name={guild.name}
              isBotIn={isBotInGuild}
              img={
                guild.icon
                  ? `https://cdn.discordapp.com/icons/${guild.id}/${guild.icon}`
                  : "generic-image.png"
              }
              id={guild.id}
              invite_url={invite_url}
            />
          );
        })}
      </div>
    </div>
  );
}
