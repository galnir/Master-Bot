import { GetServerSideProps, GetServerSidePropsContext } from 'next';
import { useRouter } from 'next/router';
import { ReactElement } from 'react';
import DashboardLayout from '../../../components/DashboardLayout';
import { getServerSession } from '../../../shared/get-server-session';
import { trpc } from '../../../utils/trpc';
import { NextPageWithLayout } from '../../_app';

const GuildIndexPage: NextPageWithLayout = () => {
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

  return (
    <div>
      <h1>guild index page dynamic route</h1>
    </div>
  );
};

GuildIndexPage.getLayout = function getLayout(page: ReactElement) {
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

export default GuildIndexPage;
