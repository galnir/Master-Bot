import {
  type ActionFunction,
  json,
  type LoaderFunction,
} from "@remix-run/node";
import {
  Form,
  useActionData,
  useFetcher,
  useLoaderData,
  useTransition,
} from "@remix-run/react";
import type { TextChannel } from "discord.js";
import React from "react";
import ValidationMessage from "~/components/ValidationMessage";
import WelcomeMessageChannelDropDown from "~/components/WelcomeMessageChannelDropDown";

type LoaderData = {
  welcome_message: string | null;
  welcome_message_enabled: boolean;
  welcome_message_channel: string | null;
  guild_id: string | null;
  channels: TextChannel[];
};

export const loader: LoaderFunction = async ({ request, params }) => {
  const { id } = params;
  const response = await fetch("http://localhost:1212/guild?id=" + id);

  if (response.status !== 200) {
    return json({ error: "Something went wrong!" });
  }

  const channelsResponse = await fetch(
    "http://localhost:1212/channels?guildID=" + id
  );
  const channels = await channelsResponse.json();

  const guild = await response.json();
  const welcome_message = guild.welcomeMessage;
  const welcome_message_enabled = guild.welcomeMessageEnabled;
  const welcome_message_channel = guild.welcomeMessageChannel;

  return json({
    welcome_message,
    welcome_message_enabled,
    welcome_message_channel,
    guild_id: id,
    channels,
  });
};

export const action: ActionFunction = async ({ request, params }) => {
  const { id } = params;
  const formData = await request.formData();

  const channelID = formData.get("channelID");
  console.log(channelID);
  if (channelID) {
    await fetch("http://localhost:1212/guild?id=" + id, {
      method: "PATCH",
      body: JSON.stringify({ welcomeMessageChannel: channelID }),
    });

    return null;
  }

  const entry = formData.get("welcome_toggle");
  if (entry) {
    // @ts-ignore
    const entryObject = JSON.parse(entry);

    await fetch("http://localhost:1212/guild?id=" + id, {
      method: "PATCH",
      body: JSON.stringify({ welcomeMessageEnabled: entryObject.toggle }),
    });

    return null;
  }

  const welcomeMessage = formData.get("welcome_message");

  const response = await fetch("http://localhost:1212/guild?id=" + id, {
    method: "PATCH",
    body: JSON.stringify({ welcomeMessage, welcomeMessageEnabled: true }),
  });

  const values = Object.fromEntries(formData);
  if (response.status !== 200) {
    return json({ error: "Something went wrong!", values });
  }

  return null;
};

export default function WelcomeScreen() {
  const {
    welcome_message,
    welcome_message_enabled,
    welcome_message_channel,
    guild_id,
    channels,
  } = useLoaderData<LoaderData>();
  const [welcomeMessageEdit, setWelcomeMessageEdit] = React.useState(
    welcome_message_enabled
  );

  const fetcher = useFetcher();
  const transition = useTransition();
  const actionData = useActionData();

  return (
    <div className="p-10">
      <h1 className="text-white text-3xl">Welcome Message Settings</h1>
      <div className="flex justify-between w-full">
        <h3 className="my-10">Welcome new users with a custom message</h3>
        <div className="flex items-center gap-5">
          <span>{welcome_message_enabled ? "Enabled" : "Disabled"}</span>
          <fetcher.Form method="post">
            <input
              type="hidden"
              name="welcome_toggle"
              value={JSON.stringify({ toggle: welcomeMessageEdit })}
            />
            <button
              role="checkbox"
              onClick={() => setWelcomeMessageEdit(!welcomeMessageEdit)}
              aria-checked={welcome_message_enabled ? "true" : "false"}
              aria-label={welcome_message_enabled ? "checked" : "unchecked"}
            >
              <label
                htmlFor="default-toggle"
                className="inline-flex relative items-center cursor-pointer"
              >
                <input
                  type="checkbox"
                  value=""
                  id="default-toggle"
                  defaultChecked={welcomeMessageEdit}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
              </label>
            </button>
          </fetcher.Form>
        </div>
      </div>
      {welcomeMessageEdit ? (
        <div className="w-96 relative">
          <WelcomeMessageChannelDropDown
            welcome_channel={welcome_message_channel}
            channels={channels}
            id={guild_id as string}
          />
          <Form method="post" action="." className="mt-6">
            <fieldset disabled={transition.state === "submitting"}>
              {actionData?.error ? (
                <ValidationMessage
                  isSubmitting={transition.state === "submitting"}
                  error={actionData?.error}
                />
              ) : null}
              <p>
                <label>
                  Welcome Message:
                  <br />
                  <textarea
                    name="welcome_message"
                    placeholder={welcome_message ?? ""}
                    defaultValue={actionData?.values.welcome_message}
                    className="block -ml-1 w-full bg-black outline-none overflow-auto my-2 resize-none p-4 text-white rounded-lg border border-gray-800 focus:ring-blue-600 focus:border-blue-600"
                  />
                </label>
              </p>
              <p className="relative">
                <button
                  type="submit"
                  className="bg-blue-600 p-4 rounded-lg text-white absolute top-3 right-2 hover:bg-blue-700"
                >
                  {transition.state === "submitting" ? "Saving..." : "Save"}
                </button>
              </p>
            </fieldset>
          </Form>
        </div>
      ) : null}
    </div>
  );
}
