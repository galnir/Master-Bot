import type { LoaderFunction } from "@remix-run/node";
import { json } from "@remix-run/node";
import { Link, useCatch, useLoaderData } from "@remix-run/react";
import { authenticator } from "~/server/auth.server";
import type { DiscordProfile } from "~/lib/discord-api-fetcher";
import GuildSelectBox from "~/components/GuildSelectBox";

type LoaderData = {
  user: DiscordProfile;
  databaseGuilds: any[] | null;
};

export let loader: LoaderFunction = async ({ request, params }) => {
  const user = (await authenticator.isAuthenticated(request, {
    failureRedirect: "/login",
  })) as DiscordProfile;

  const response = await fetch(
    `http://localhost:1212/guilds?ownerId=${user.id}`
  );
  const databaseGuilds = await response.json();

  return json({ user, databaseGuilds });
};

export default function DashboardIndex() {
  const { user, databaseGuilds } = useLoaderData<LoaderData>();
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
              img={guild.icon ?? "generic-image.png"}
            />
          );
        })}
      </div>
    </div>
  );
}
