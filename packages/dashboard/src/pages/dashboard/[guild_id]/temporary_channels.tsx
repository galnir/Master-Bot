import React from "react";
import { useRouter } from "next/router";
import { ReactElement } from "react";
import DashboardLayout from "../../../components/DashboardLayout";
import { trpc } from "../../../utils/trpc";
import { NextPageWithLayout } from "../../_app";

const TemporaryChannelsDashboardPage: NextPageWithLayout = () => {
  const [isToggling, setIsToggling] = React.useState(false);
  const router = useRouter();

  const query = router.query.guild_id;
  if (!query || typeof query !== "string") {
    router.push("/");
  }

  function handleToggle() {
    setIsToggling(true);
    if (enabled) {
      deleteHub(
        { guildId: query as string },
        {
          onSuccess: () => {
            setIsToggling(false);
            utils.invalidateQueries(["guild.get-guild"]);
          },
          onError: () => {
            setIsToggling(false);
          },
        }
      );
    } else {
      createHub(
        { guildId: query as string, name: "Join To Create" },
        {
          onSuccess: () => {
            setIsToggling(false);
            utils.invalidateQueries(["guild.get-guild"]);
          },
          onError: () => {
            setIsToggling(false);
          },
        }
      );
    }
  }

  const { mutate: createHub } = trpc.useMutation(["hub.create"]);
  const { mutate: deleteHub } = trpc.useMutation(["hub.delete"]);
  const utils = trpc.useContext();
  const { data, isLoading } = trpc.useQuery([
    "guild.get-guild",
    {
      id: query as string,
    },
  ]);

  const enabled = data?.guild?.hub && data.guild.hubChannel;

  return (
    <div className="p-10">
      <h1 className="text-white text-3xl">Temporary Channels</h1>
      <p className="mt-3">
        Creating a hub enables users to create their own temporary voice
        channels with permissions over it
      </p>
      {data?.guild && !isLoading ? (
        <div className="flex flex-col gap-4">
          <h3>
            The temporary channels feature is {enabled ? "enabled" : "disabled"}
            , do you want to {enabled ? "disable" : "enable"} it?
          </h3>
          <button
            type="submit"
            disabled={isToggling}
            onClick={handleToggle}
            className="bg-red-600 text-white mx-auto w-fit block p-1 rounded-sm hover:bg-red-500"
          >
            {isToggling
              ? enabled
                ? "Disabling..."
                : "Enabling..."
              : enabled
              ? "Disable"
              : "Enable"}
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

export default TemporaryChannelsDashboardPage;
