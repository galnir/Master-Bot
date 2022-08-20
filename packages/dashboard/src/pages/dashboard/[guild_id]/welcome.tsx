import React from "react";
import { useRouter } from "next/router";
import { ReactElement } from "react";
import DashboardLayout from "../../../components/DashboardLayout";
import { trpc } from "../../../utils/trpc";
import { NextPageWithLayout } from "../../_app";
import { Switch } from "@headlessui/react";
import WelcomeMessageInput from "../../../components/WelcomeMessageInput";
import WelcomeMessageChannelPicker from "../../../components/WelcomeMessageChannelPicker";

const GuildIndexPage: NextPageWithLayout = () => {
  const router = useRouter();

  const query = router.query.guild_id;
  if (!query || typeof query !== "string") {
    router.push("/");
  }
  const utils = trpc.useContext();
  const { data, isLoading } = trpc.useQuery([
    "guild.get-guild",
    {
      id: query as string,
    },
  ]);

  const { mutate } = trpc.useMutation(["welcome.toggle"]);

  function toggleWelcomeMessage(status: boolean) {
    mutate(
      { guildId: query as string, status },
      {
        onSuccess: () => {
          utils.invalidateQueries(["guild.get-guild"]);
        },
      }
    );
  }

  return (
    <div className="p-10 text-white">
      <h1 className="text-3xl">Welcome Message Settings</h1>
      {isLoading || !data || !data.guild ? (
        <div>Loading...</div>
      ) : (
        <div>
          <h3 className="my-10">Welcome new users with a custom message</h3>
          <div className="flex items-center gap-5">
            <span>
              {data?.guild?.welcomeMessageEnabled ? "Enabled" : "Disabled"}
            </span>
            <Switch
              checked={data?.guild?.welcomeMessageEnabled}
              onChange={() =>
                toggleWelcomeMessage(!data?.guild?.welcomeMessageEnabled)
              }
              className={`${
                data?.guild?.welcomeMessageEnabled
                  ? "bg-blue-600"
                  : "bg-gray-400"
              } relative inline-flex h-6 w-11 items-center rounded-full`}
            >
              <span
                aria-hidden="true"
                className={`${
                  data?.guild?.welcomeMessageEnabled
                    ? "translate-x-6"
                    : "translate-x-1"
                } inline-block h-4 w-4 transform rounded-full bg-white transition duration-200 ease-in-out`}
              />
            </Switch>
          </div>
          <>
            {data?.guild?.welcomeMessageEnabled ? (
              <>
                <WelcomeMessageInput guildId={query as string} />
                <div className="mt-10">
                  <WelcomeMessageChannelPicker guildId={query as string} />
                </div>
              </>
            ) : null}
          </>
        </div>
      )}
    </div>
  );
};

GuildIndexPage.getLayout = function getLayout(page: ReactElement) {
  return <DashboardLayout>{page}</DashboardLayout>;
};

export default GuildIndexPage;
