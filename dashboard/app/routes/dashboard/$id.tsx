import type { LoaderFunction } from "@remix-run/node";
import { json } from "@remix-run/node";
import { Link, Outlet, useCatch, useLoaderData } from "@remix-run/react";
import Logo from "~/components/Logo";
import type { DiscordProfile } from "~/lib/discord-api-fetcher";
import { authenticator } from "~/server/auth.server";

type LoaderData = {
  guild: any;
  user: DiscordProfile;
};

export let loader: LoaderFunction = async ({ request, params }) => {
  const user = (await authenticator.isAuthenticated(request, {
    failureRedirect: "/login",
  })) as DiscordProfile;
  const response = await fetch(`http://localhost:1212/guild?id=${params.id}`);

  const guild = await response.json();
  return json({ guild, user });
};

export default function DashboardScreenIndex() {
  const { guild, user } = useLoaderData<LoaderData>();
  return (
    <main className="flex text-gray-400 w-full h-screen">
      <div className="min-w-[350px] border-r-2 border-gray-500">
        <div className="p-8 overflow-auto">
          <div className="mb-8">
            <Logo />
          </div>
          <div className="bg-black text-center text-white font-semibold py-2 mb-12">
            <p>{guild.name}</p>
          </div>
          <div className="hover:text-slate-300">
            <div>
              <Link to="welcome">
                <p>Welcome Message</p>
              </Link>
            </div>
          </div>
        </div>
      </div>
      <div className="grow">
        <Outlet />
      </div>
    </main>
  );
}
