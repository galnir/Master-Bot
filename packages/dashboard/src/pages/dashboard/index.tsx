import { GetServerSideProps, GetServerSidePropsContext, NextPage } from 'next';
import Head from 'next/head';
import { getServerSession } from '../../shared/get-server-session';
import { trpc } from '../../utils/trpc';
import GuildSelectBox from '../../components/GuildSelectBox';

const DashboardIndexPage: NextPage = () => {
  const { data } = trpc.guild.getAll.useQuery();

  return (
    <div className="bg-slate-900 h-screen text-gray-100">
      <Head>
        <title>Choose Guild</title>
        <meta name="description" content="Choose guild to manage screen" />
      </Head>
      <main className="p-10">
        <h1 className="text-3xl mb-4 ml-1">Choose guild to manage</h1>
        {data?.apiGuilds ? (
          <div className="flex gap-10">
            {data?.apiGuilds.map(guild => {
              const isBotInGuild = data.dbGuilds.some(
                dbGuild => dbGuild.id === guild.id
              );
              return (
                <GuildSelectBox
                  key={guild.id}
                  img={
                    guild.icon
                      ? `https://cdn.discordapp.com/icons/${guild.id}/${guild.icon}`
                      : 'generic-image.png'
                  }
                  name={guild.name}
                  isBotIn={isBotInGuild}
                  id={guild.id}
                />
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
      redirect: { destination: '../api/auth/signin', permanent: false },
      props: {}
    };
  }

  return {
    props: {
      session
    }
  };
};

export default DashboardIndexPage;
