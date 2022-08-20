import React from "react";
import Logo from "../Logo";
import Link from "next/link";
import { trpc } from "../../utils/trpc";
import { useRouter } from "next/router";
import Head from "next/head";

const DashboardLayout = ({ children }: { children: React.ReactNode }) => {
  const [menuOpen, setMenuOpen] = React.useState(false);
  const router = useRouter();
  const query = router.query.guild_id;

  if (!query || typeof query !== "string") {
    router.push("/");
  }

  const { data, isLoading } = trpc.useQuery([
    "guild.get-guild",
    {
      id: query as string,
    },
  ]);

  return (
    <>
      <Head>
        <title>
          {data?.guild ? data?.guild.name : "Master Bot"} - Dashboard
        </title>
      </Head>
      <main className="flex text-gray-400 w-full h-screen relative">
        <div className="min-w-[350px] border-r-2 border-gray-500">
          <div className="p-8 fixed h-full">
            <div className="mb-8">
              <Logo />
            </div>
            <div className="bg-black text-center text-white font-semibold py-2 mb-12 rounded-xl">
              <p>
                {isLoading && !data ? "Loading Guild..." : data!.guild!.name}
              </p>
            </div>
            <div className="flex flex-col gap-8">
              <div className="hover:text-slate-300">
                <Link href={`/dashboard/${query}/welcome`}>
                  <p>Welcome Message</p>
                </Link>
              </div>
              <div className="hover:text-slate-300">
                <Link href={`${query}/commands`}>
                  <p>Commands</p>
                </Link>
              </div>
              <div className="hover:text-slate-300">
                <Link href={`${query}/tempchannels`}>
                  <p>Temporary Channels</p>
                </Link>
              </div>
            </div>
          </div>
        </div>
        <div className="grow">{children}</div>
      </main>
    </>
  );
};

export default DashboardLayout;
