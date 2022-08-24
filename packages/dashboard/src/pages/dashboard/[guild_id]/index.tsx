import { GetServerSideProps, GetServerSidePropsContext } from "next";
import { ReactElement } from "react";
import DashboardLayout from "../../../components/DashboardLayout";
import { getServerSession } from "../../../shared/get-server-session";
import { NextPageWithLayout } from "../../_app";
import { prisma } from "@master-bot/api/src/db/client";

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

  const user = await prisma.user.findUnique({
    where: {
      id: session.user.id,
    },
    select: {
      guilds: {
        select: {
          id: true,
        },
      },
    },
  });

  const ids = user?.guilds.filter((guild) => guild.id === ctx.query?.guild_id);
  if (!ctx.query.guild_id || ids?.length! === 0) {
    return {
      redirect: { destination: "../../", permanent: false },
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
