import React from 'react';
import { useRouter } from 'next/router';
import { ReactElement } from 'react';
import DashboardLayout from '../../../components/DashboardLayout';
import { trpc } from '../../../utils/trpc';
import { NextPageWithLayout } from '../../_app';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { GetServerSideProps, GetServerSidePropsContext } from 'next';
import { getServerSession } from '../../../shared/get-server-session';

const TemporaryChannelsDashboardPage: NextPageWithLayout = () => {
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

  return <TemporaryChannelsDashboardPageComponent query={query as string} />;
};

const TemporaryChannelsDashboardPageComponent = ({
  query
}: {
  query: string;
}) => {
  const [isToggling, setIsToggling] = React.useState(false);

  function handleToggle() {
    setIsToggling(true);
    if (enabled) {
      deleteHub(
        { guildId: query as string },
        {
          onSuccess: () => {
            setIsToggling(false);
            toast.success('Temporary channels disabled', {
              position: 'top-right',
              autoClose: 5000,
              hideProgressBar: false,
              closeOnClick: true,
              pauseOnHover: false,
              draggable: true,
              progress: undefined
            });
            utils.guild.getGuild.invalidate();
          },
          onError: () => {
            setIsToggling(false);
            toast.error('Error!', {
              position: 'top-right',
              autoClose: 5000,
              hideProgressBar: false,
              closeOnClick: true,
              pauseOnHover: false,
              draggable: true,
              progress: undefined
            });
          }
        }
      );
    } else {
      createHub(
        { guildId: query as string, name: 'Join To Create' },
        {
          onSuccess: () => {
            setIsToggling(false);
            toast.success('Temporary channels enabled', {
              position: 'top-right',
              autoClose: 5000,
              hideProgressBar: false,
              closeOnClick: true,
              pauseOnHover: false,
              draggable: true,
              progress: undefined
            });
            utils.guild.getGuild.invalidate();
          },
          onError: () => {
            setIsToggling(false);
            toast.error('Error!', {
              position: 'top-right',
              autoClose: 5000,
              hideProgressBar: false,
              closeOnClick: true,
              pauseOnHover: false,
              draggable: true,
              progress: undefined
            });
          }
        }
      );
    }
  }

  const { mutate: createHub } = trpc.hub.create.useMutation();
  const { mutate: deleteHub } = trpc.hub.delete.useMutation();
  const utils = trpc.useContext();
  const { data, isLoading } = trpc.guild.getGuild.useQuery({
    id: query as string
  });

  const enabled = data?.guild?.hub && data.guild.hubChannel;

  return (
    <div className="p-10 text-xl">
      <h1 className="text-white text-5xl">Temporary Channels</h1>
      <p className="mt-3">
        Creating a hub enables users to create their own temporary voice
        channels with permissions over it
      </p>
      {data?.guild && !isLoading ? (
        <div className="flex flex-col gap-4">
          <h3>
            The temporary channels feature is {enabled ? 'enabled' : 'disabled'}
            , do you want to {enabled ? 'disable' : 'enable'} it?
          </h3>
          <button
            type="submit"
            disabled={isToggling}
            onClick={handleToggle}
            className="bg-red-600 text-white mx-auto w-fit block p-1 px-2 rounded-sm hover:bg-red-500"
          >
            {isToggling
              ? enabled
                ? 'Disabling...'
                : 'Enabling...'
              : enabled
              ? 'Disable'
              : 'Enable'}
          </button>
        </div>
      ) : (
        <div>Loading...</div>
      )}
    </div>
  );
};

TemporaryChannelsDashboardPage.getLayout = function getLayout(
  page: ReactElement
) {
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

export default TemporaryChannelsDashboardPage;
