import type {
  GetServerSideProps,
  GetServerSidePropsContext,
  NextPage
} from 'next';
import Head from 'next/head';
import HeaderButton from '../components/HeaderButton';
import Logo from '../components/Logo';
import { getServerSession } from '../shared/get-server-session';

const HomeComponent = () => {
  return (
    <div className="bg-slate-900 h-screen">
      <Head>
        <title>Master Bot Dashboard</title>
        <meta
          name="description"
          content="Dashboard that controls master bot settings"
        />
      </Head>
      <header className="p-40 py-10 flex justify-between">
        <div>
          <Logo />
        </div>
        <div className="flex items-center justify-between gap-5">
          <HeaderButton
            linkTo="https://github.com/galnir/Master-Bot"
            external={true}
            newWindow={true}
          >
            Code
          </HeaderButton>
          <HeaderButton linkTo="/dashboard">Dashboard</HeaderButton>
        </div>
      </header>
      <main></main>
    </div>
  );
};

const IndexPage: NextPage = () => {
  return <HomeComponent />;
};

export const getServerSideProps: GetServerSideProps = async (
  context: GetServerSidePropsContext
) => {
  const session = await getServerSession(context);

  return {
    props: {
      session
    }
  };
};

export default IndexPage;
