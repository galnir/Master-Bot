import React from "react";
import { useRouter } from "next/router";
import { ReactElement } from "react";
import DashboardLayout from "../../../components/DashboardLayout";
import { trpc } from "../../../utils/trpc";
import { NextPageWithLayout } from "../../_app";

const TemporaryChannelsDashboardPage: NextPageWithLayout = () => {
  const { mutate } = trpc.useMutation(["hub.create"]);
  const { mutate: deleteHub } = trpc.useMutation(["hub.delete"]);
  return (
    <div>
      <h1
        onClick={() => {
          mutate({ name: "test", guildId: "336505000828076032" });
        }}
      >
        Temp channels page
      </h1>
      <h2 onClick={() => deleteHub({ guildId: "336505000828076032" })}>
        Delete
      </h2>
    </div>
  );
};

TemporaryChannelsDashboardPage.getLayout = function getLayout(
  page: ReactElement
) {
  return <DashboardLayout>{page}</DashboardLayout>;
};

export default TemporaryChannelsDashboardPage;
