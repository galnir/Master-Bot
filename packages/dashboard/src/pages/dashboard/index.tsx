import { GetServerSideProps, GetServerSidePropsContext, NextPage } from "next";
import Head from "next/head";
import { getServerSession } from "../../shared/get-server-session";
import { trpc } from "../../utils/trpc";
import GuildSelectBox from "../../components/GuildSelectBox";
import { env } from "../../env/client.mjs";

const allowInvite =
  env.NEXT_PUBLIC_ALLOW_NEW_GUILDS.toLowerCase() == "true" ? true : false;
const DashboardIndexPage: NextPage = () => {
  const { data } = trpc.useQuery(["guild.get-all"]);

  return (
    <div className="bg-slate-900 h-screen text-gray-100">
      <Head>
        <title>Choose Guild</title>
        <meta name="description" content="Choose guild to manage screen" />
      </Head>
      <main className="p-10 bg-slate-900">
        <h1 className="text-3xl mb-4">Choose guild to manage</h1>
        {data?.apiGuilds ? (
          <div className="flex flex-wrap gap-10">
            {data?.apiGuilds.map((guild) => {
              const isBotInGuild = data.dbGuilds.some(
                (dbGuild) => dbGuild.id === guild.id
              );
              return (
                <div
                  key={`${guild.id}`}
                  className={
                    "fluid bg-slate-500 bg-opacity-25 shadow-md shadow-slate-900 rounded-md" +
                    (isBotInGuild
                      ? " opacity-100"
                      : allowInvite
                      ? " opacity-75"
                      : " opacity-20 cursor-not-allowed grayscale")
                  }
                >
                  <GuildSelectBox
                    key={guild.id}
                    img={
                      guild.icon
                        ? `https://cdn.discordapp.com/icons/${guild.id}/${guild.icon}`
                        : "generic-image.png"
                    }
                    name={guild.name}
                    isBotIn={isBotInGuild}
                    id={guild.id}
                  />
                </div>
              );
            })}
          </div>
        ) : null}
      </main>
    </div>
  );
};

export const getServerSideProps: GetServerSideProps = async (
  ctx: GetServerSidePropsContext
) => {
  const session = await getServerSession(ctx);

  if (!session || !session.user || !session.user.id) {
    return {
      redirect: { destination: "../api/auth/signin", permanent: false },
      props: {},
    };
  }

  return {
    props: {
      session,
    },
  };
};

export default DashboardIndexPage;
