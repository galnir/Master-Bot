import { GetServerSideProps, GetServerSidePropsContext } from "next";
import { ReactElement } from "react";
import DashboardLayout from "../../../components/DashboardLayout";
import { getServerSession } from "../../../shared/get-server-session";
import { NextPageWithLayout } from "../../_app";

const GuildIndexPage: NextPageWithLayout = () => {
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
      redirect: { destination: "../../api/auth/signin", permanent: false },
      props: {},
    };
  }
  return {
    props: {
      session,
    },
  };
};

export default GuildIndexPage;
