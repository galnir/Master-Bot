import { GetServerSideProps, GetServerSidePropsContext } from 'next';
import { useRouter } from 'next/router';
import type { ReactElement } from 'react';
import CommandInfo from '../../../../components/CommandInfo';
import DashboardLayout from '../../../../components/DashboardLayout';
import { getServerSession } from '../../../../shared/get-server-session';
import { trpc } from '../../../../utils/trpc';
import { NextPageWithLayout } from '../../../_app';

const CommandsDashboardPage: NextPageWithLayout = () => {
  const router = useRouter();
  const query = router.query.guild_id;
  if (!query || typeof query !== 'string') {
    router.push('/');
  }

  const { isLoading, error } = trpc.guild.getGuildAndUser.useQuery(
    { id: query as string },
    { refetchOnWindowFocus: false }
  );

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (error?.data?.code === 'UNAUTHORIZED') {
    return <div>{error.message}</div>;
  }

  return <CommandsDashboardPageComponent query={query as string} />;
};

const CommandsDashboardPageComponent = ({
  query
}: {
  query: string;
}): ReactElement => {
  const { data, isLoading } = trpc.command.getCommands.useQuery({
    guildId: query as string
  });

  const { data: disabledCommandsData, isLoading: disabledCommandsLoading } =
    trpc.command.getDisabledCommands.useQuery({ guildId: query as string });

  return (
    <div className="p-10">
      <h1 className="text-slate-200 text-3xl mb-3 ml-1">
        Enable / Disable Commands Panel
      </h1>
      {data?.commands &&
      !isLoading &&
      disabledCommandsData?.disabledCommands &&
      !disabledCommandsLoading ? (
        <div className="p-5 bg-gray-900 text-slate-300 flex flex-col gap-7">
          {data.commands.map(command => (
            <CommandInfo
              key={command.id}
              guildId={query as string}
              commandId={command.id}
              disabled={disabledCommandsData.disabledCommands.includes(
                command.id
              )}
              name={command.name}
              description={command.description}
            />
          ))}
        </div>
      ) : (
        <div>Loading</div>
      )}
    </div>
  );
};

CommandsDashboardPage.getLayout = function getLayout(page: ReactElement) {
  return <DashboardLayout>{page}</DashboardLayout>;
};

export const getServerSideProps: GetServerSideProps = async (
  ctx: GetServerSidePropsContext
) => {
  const session = await getServerSession(ctx);

  if (!session || !session.user || !session.user.id) {
    return {
      redirect: { destination: '../../api/auth/signin', permanent: false },
      props: {}
    };
  }

  return {
    props: {
      session
    }
  };
};

export default CommandsDashboardPage;
