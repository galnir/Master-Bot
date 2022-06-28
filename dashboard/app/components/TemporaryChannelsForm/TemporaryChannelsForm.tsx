import { useFetcher } from "@remix-run/react";

const TemporaryChannelsForm = ({
  guildID,
  enabled,
}: {
  guildID: string;
  enabled: boolean;
}) => {
  const fetcher = useFetcher();

  return (
    <div className="flex flex-col gap-4">
      <h3>
        The temporary channels feature is {enabled ? "enabled" : "disabled"}, do
        you want to {enabled ? "disable" : "enable"} it?
      </h3>
      <fetcher.Form
        method="post"
        action={`/dashboard/${guildID}/temporary-channels`}
      >
        <input
          type="hidden"
          name="enabled"
          value={enabled ? "true" : "false"}
        />
        <button
          type="submit"
          className="bg-red-600 mx-auto w-fit block p-1 rounded-sm hover:bg-red-500"
        >
          {fetcher.state === "submitting"
            ? enabled
              ? "Disabling..."
              : "Enabling..."
            : enabled
            ? "Disable"
            : "Enable"}
        </button>
      </fetcher.Form>
    </div>
  );
};

export default TemporaryChannelsForm;
