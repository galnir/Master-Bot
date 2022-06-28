import { Switch } from "@headlessui/react";
import { useFetcher } from "@remix-run/react";
import React from "react";

const CommandInfo = ({
  name,
  description,
  id,
  isDisabled,
  guildID,
}: {
  name: string;
  description: string;
  id: string;
  isDisabled: boolean;
  guildID: string;
}) => {
  const [enabled, setEnabled] = React.useState(!isDisabled);

  const fetcher = useFetcher();

  return (
    <div
      className={`p-5 flex justify-between items-center transition duration-200 ease-in-out ${
        enabled ? "bg-black" : "bg-gray-700"
      }`}
    >
      <div className="flex flex-col gap-2">
        <h2
          className={`transition duration-200 ease-in-out ${
            enabled ? "text-white" : "text-slate-400"
          }`}
        >
          {name}
        </h2>
        <h3>{description}</h3>
      </div>
      <div>
        <Switch
          checked={enabled}
          onChange={() => {
            fetcher.submit(
              { id, enabled: JSON.stringify(!enabled) },
              { method: "post", action: `/dashboard/${guildID}/commands` }
            );
            setEnabled(!enabled);
          }}
          className={`${
            enabled ? "bg-blue-600" : "bg-gray-400"
          } relative inline-flex h-6 w-11 items-center rounded-full`}
        >
          <span className="sr-only">Enable or disable command</span>
          <span
            aria-hidden="true"
            className={`${
              enabled ? "translate-x-6" : "translate-x-1"
            } inline-block h-4 w-4 transform rounded-full bg-white transition duration-200 ease-in-out`}
          />
        </Switch>
      </div>
    </div>
  );
};

export default CommandInfo;
