import { GetServerSideProps, GetServerSidePropsContext } from "next";
import { useRouter } from "next/router";
import { ReactElement } from "react";
import DashboardLayout from "../../../components/DashboardLayout";
import { getServerSession } from "../../../shared/get-server-session";
import { trpc } from "../../../utils/trpc";
import { NextPageWithLayout } from "../../_app";

const GuildIndexPage: NextPageWithLayout = () => {
  const router = useRouter();

  const query = router.query.guild_id;
  if (!query || typeof query !== "string") {
    router.push("/");
  }

  const { data, isLoading } = trpc.useQuery(
    ["guild.get-all-from-discord-api"],
    { refetchOnWindowFocus: false }
  );

  if (!data) {
    return <div>Loading...</div>;
  }

  if (
    !data ||
    isLoading ||
    !data.guilds ||
    !Array.isArray(data.guilds) ||
    data?.guilds.filter((guild) => guild.id === query && guild.owner).length ===
      0
  ) {
    return <div>No access</div>;
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

  return {
    props: {
      session,
    },
  };
};

export default GuildIndexPage;
