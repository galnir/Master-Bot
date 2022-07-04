import {
  type ActionFunction,
  json,
  type LoaderFunction,
} from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import React from "react";
import TemporaryChannelsForm from "~/components/TemporaryChannelsForm";

type LoaderData = {
  hub: string | null;
  hubChannel: string | null;
  id: string;
};

export const action: ActionFunction = async ({ request, params }) => {
  const { id } = params;
  const formData = await request.formData();
  const enabled = formData.get("enabled");

  // that means user wants to disable
  if (enabled === "true") {
    await fetch(`http://localhost:1212/hub?guildID=${id}`, {
      method: "DELETE",
    });
    return null;
  }
  // that means user wants to enable
  else if (enabled === "false") {
    await fetch(`http://localhost:1212/hub?guildID=${id}&name=hub`, {
      method: "POST",
    });
    return null;
  }

  return null;
};

export const loader: LoaderFunction = async ({ request, params }) => {
  const { id } = params;

  const response = await fetch("http://localhost:1212/guild?id=" + id);

  const guildDB = await response.json();

  const { hub, hubChannel } = guildDB;

  return json({ hub, hubChannel, id });
};

export default function TemporaryChannelsScreen() {
  const { hub, hubChannel, id } = useLoaderData<LoaderData>();
  return (
    <div className="p-10">
      <h1 className="text-white text-3xl">Temporary Channels</h1>
      <p className="mt-3">
        Creating a hub enables users to create their own temporary voice
        channels with permissions over it
      </p>
      <div className="mt-16 w-fit mx-auto">
        <div className=" text-white bg-gray-700 p-4">
          <TemporaryChannelsForm
            guildID={id}
            enabled={hub && hubChannel ? true : false}
          />
        </div>
      </div>
    </div>
  );
}
