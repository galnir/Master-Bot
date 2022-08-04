import { Switch } from "@headlessui/react";
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
import type { GuildBasedChannel } from "discord.js";
import { AnimatePresence, motion } from "framer-motion";
import React from "react";
import DiscordMessage from "~/components/DiscordMessage";
import ValidationMessage from "~/components/ValidationMessage";
import WelcomeMessageChannelDropDown from "~/components/WelcomeMessageChannelDropDown";
import type { Guild } from "~/api-types";

type LoaderData = {
  welcome_message: string | null;
  welcome_message_enabled: boolean;
  welcome_message_channel: string | null;
  guild_id: string | null;
  channels: GuildBasedChannel[];
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
  const channels: GuildBasedChannel[] = await channelsResponse.json();

  const guild: Guild = await response.json();
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
  if (channelID) {
    await fetch("http://localhost:1212/guild?id=" + id, {
      method: "PATCH",
      body: JSON.stringify({ welcomeMessageChannel: channelID }),
    });

    return null;
  }

  const entry = formData.get("welcome_toggle");
  if (entry) {
    await fetch("http://localhost:1212/guild?id=" + id, {
      method: "PATCH",
      body: JSON.stringify({ welcomeMessageEnabled: entry === "true" }),
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
  const [welcomeMessageText, setWelcomeMessageText] =
    React.useState(welcome_message);

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
          <Switch
            checked={welcome_message_enabled}
            onChange={() => {
              fetcher.submit(
                {
                  welcome_toggle: JSON.stringify(!welcome_message_enabled),
                },
                { method: "patch", action: `/dashboard/${guild_id}/welcome` }
              );
              setWelcomeMessageEdit(!welcome_message_enabled);
            }}
            className={`${
              welcome_message_enabled ? "bg-blue-600" : "bg-gray-400"
            } relative inline-flex h-6 w-11 items-center rounded-full`}
          >
            <span className="sr-only">
              ${welcome_message_enabled ? "Enable" : "Disable"} welcome message
            </span>
            <span
              aria-hidden="true"
              className={`${
                welcome_message_enabled ? "translate-x-6" : "translate-x-1"
              } inline-block h-4 w-4 transform rounded-full bg-white transition duration-200 ease-in-out`}
            />
          </Switch>
        </div>
      </div>
      <AnimatePresence>
        {welcomeMessageEdit ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="w-96 relative"
          >
            <WelcomeMessageChannelDropDown
              welcome_channel={welcome_message_channel}
              channels={channels as GuildBasedChannel[]}
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
                      onChange={(e) => setWelcomeMessageText(e.target.value)}
                      defaultValue={actionData?.values.welcome_message}
                      className="block -ml-1 w-full bg-black outline-none overflow-auto my-2 resize-none p-4 text-white rounded-lg border border-gray-800 focus:ring-blue-600 focus:border-blue-600"
                    />
                  </label>
                </p>
                <p className="text-right pr-2">
                  <button
                    type="submit"
                    className="bg-blue-600 p-4 rounded-lg text-white hover:bg-blue-700"
                  >
                    {transition.state === "submitting" ? "Saving..." : "Save"}
                  </button>
                </p>
              </fieldset>
            </Form>
            <div className="mt-5">
              <DiscordMessage
                text={welcomeMessageText || ""}
                avatar="generic-image.png"
              />
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
}
