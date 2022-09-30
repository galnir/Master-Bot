import { useRouter } from 'next/router';
import { ReactElement } from 'react';
import DashboardLayout from '../../../components/DashboardLayout';
import { trpc } from '../../../utils/trpc';
import { NextPageWithLayout } from '../../_app';
import { Switch } from '@headlessui/react';
import WelcomeMessageInput from '../../../components/WelcomeMessageInput';
import WelcomeMessageChannelPicker from '../../../components/WelcomeMessageChannelPicker';
import { GetServerSideProps, GetServerSidePropsContext } from 'next';
import { getServerSession } from '../../../shared/get-server-session';

const WelcomeDashboardPage: NextPageWithLayout = () => {
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

  return <WelcomeDashboardPageComponent query={query as string} />;
};

const WelcomeDashboardPageComponent = ({ query }: { query: string }) => {
  const utils = trpc.useContext();
  const { data, isLoading } = trpc.guild.getGuild.useQuery({
    id: query
  });

  const { mutate } = trpc.welcome.toggle.useMutation();

  function toggleWelcomeMessage(status: boolean) {
    mutate(
      { guildId: query, status },
      {
        onSuccess: () => {
          utils.guild.getGuild.invalidate();
        }
      }
    );
  }

  return (
    <div className="p-10 text-white">
      <h1 className="text-5xl">Welcome Message Settings</h1>
      {isLoading || !data || !data.guild ? (
        <div>Loading...</div>
      ) : (
        <div className="ml-1">
          <h3 className="my-10 text-2xl">
            Welcome new users with a custom message
          </h3>
          <div className="flex items-center gap-5">
            <span>
              {data?.guild?.welcomeMessageEnabled ? 'Enabled' : 'Disabled'}
            </span>
            <Switch
              checked={data?.guild?.welcomeMessageEnabled}
              onChange={() =>
                toggleWelcomeMessage(!data?.guild?.welcomeMessageEnabled)
              }
              className={`${
                data?.guild?.welcomeMessageEnabled
                  ? 'bg-blue-600'
                  : 'bg-gray-400'
              } relative inline-flex h-6 w-11 items-center rounded-full`}
            >
              <span
                aria-hidden="true"
                className={`${
                  data?.guild?.welcomeMessageEnabled
                    ? 'translate-x-6'
                    : 'translate-x-1'
                } inline-block h-4 w-4 transform rounded-full bg-white transition duration-200 ease-in-out`}
              />
            </Switch>
          </div>
          <>
            {data?.guild?.welcomeMessageEnabled ? (
              <>
                <WelcomeMessageInput guildId={query} />
                <div className="mt-10">
                  <WelcomeMessageChannelPicker guildId={query} />
                </div>
              </>
            ) : null}
          </>
        </div>
      )}
    </div>
  );
};

WelcomeDashboardPage.getLayout = function getLayout(page: ReactElement) {
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

export default WelcomeDashboardPage;
