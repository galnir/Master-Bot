import {
  type ActionFunction,
  json,
  type LoaderFunction,
} from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import CommandInfo from "~/components/CommandInfo";

type LoaderData = {
  commands: Command[];
  disabledCommands: string[];
  guildID: string;
};

type Command = {
  id: string;
  name: string;
  description: string;
};

export const loader: LoaderFunction = async ({ request, params }) => {
  const { id } = params;
  const commandsResponse = await fetch("http://localhost:1212/commands");

  const guildResponse = await fetch("http://localhost:1212/guild?id=" + id);

  if (commandsResponse.status !== 200 || guildResponse.status !== 200) {
    return json({ error: "Something went wrong!" });
  }

  const commands = await commandsResponse.json();
  const guild = await guildResponse.json();

  const disabledCommands = guild.disabledCommands;

  return json({
    commands,
    disabledCommands,
    guildID: id,
  });
};

export const action: ActionFunction = async ({ request, params }) => {
  const { id } = params;
  const formData = await request.formData();

  const commandID = formData.get("id");
  const enabled = formData.get("enabled");

  if (!commandID) {
    return null; // should be some sort of an error message
  }

  await fetch("http://localhost:1212/command?id=" + id, {
    method: "PATCH",
    body: JSON.stringify({ enabled, commandID }),
  });

  return null;
};

export default function CommandsScreen() {
  const { commands, disabledCommands, guildID } = useLoaderData<LoaderData>();
  return (
    <div className="p-10">
      <h1 className="text-slate-100 text-3xl">
        Enable / Disable Commands Panel
      </h1>
      <div className="p-5 bg-gray-900 text-slate-300 flex flex-col gap-7">
        {commands.map((command) => (
          <CommandInfo
            key={command.id}
            guildID={guildID}
            isDisabled={disabledCommands.includes(command.id)}
            id={command.id}
            name={command.name}
            description={command.description}
          />
        ))}
      </div>
    </div>
  );
}
