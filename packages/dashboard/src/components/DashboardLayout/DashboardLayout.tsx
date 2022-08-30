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
        <title>Master Bot Dashboard</title>
      </Head>
      <main className="flex text-gray-400 w-full h-screen relative overflow-auto">
        <div className="min-w-[350px]">
          <div className="min-w-[350px] border-r-2 h-full border-gray-500 p-8 fixed">
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
                  <a>Welcome Message</a>
                </Link>
              </div>
              <div className="hover:text-slate-300">
                <Link href={`/dashboard/${query}/commands`}>
                  <a>Commands</a>
                </Link>
              </div>
              <div className="hover:text-slate-300">
                <Link href={`/dashboard/${query}/temporary_channels`}>
                  <a>Temporary Channels</a>
                </Link>
              </div>
            </div>
          </div>
        </div>
        <div className="grow ml-4">{children}</div>
      </main>
    </>
  );
};

export default DashboardLayout;
