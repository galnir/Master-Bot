import type {
  GetServerSideProps,
  GetServerSidePropsContext,
  NextPage,
} from "next";
import { useSession } from "next-auth/react";
import { getServerSession } from "../shared/get-server-session";

const Home: NextPage = () => {
  const { data: session } = useSession();
  return <div>hi {session?.user?.name}</div>;
};

export const getServerSideProps: GetServerSideProps = async (
  context: GetServerSidePropsContext
) => {
  const session = await getServerSession(context);
  if (!session || !session.user || !session.user.id) {
    return {
      redirect: { destination: "../api/auth/signin", permanent: false },
      props: { session },
    };
  }

  return {
    props: {
      session,
    },
  };
};

export default Home;
