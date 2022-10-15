import { Switch } from '@headlessui/react';
import Link from 'next/link';
import React from 'react';
import { trpc } from '../../utils/trpc';

const CommandInfo = ({
  name,
  description,
  guildId,
  commandId,
  disabled
}: {
  name: string;
  description: string;
  guildId: string;
  commandId: string;
  disabled: boolean;
}) => {
  const [disableSwitch, setDisableSwitch] = React.useState(false);
  const { mutate } = trpc.command.toggleCommand.useMutation();
  const utils = trpc.useContext();

  function handleToggle(status: boolean) {
    mutate(
      {
        guildId,
        commandId,
        status
      },
      {
        onSuccess: () => {
          utils.command.getCommands.invalidate();
          utils.command.getDisabledCommands.invalidate();
          setDisableSwitch(false);
        },
        onError: () => {
          setDisableSwitch(false);
        },
        onSettled: () => {
          setDisableSwitch(false);
        }
      }
    );
  }

  return (
    <div
      className={`p-5 flex justify-between items-center transition duration-200 ease-in-out ${
        disabled ? 'bg-gray-700' : 'bg-black'
      }`}
    >
      <div className="flex flex-col gap-2">
        <h2
          className={`transition duration-200 ease-in-out ${
            disabled ? 'text-slate-400' : 'text-white'
          }`}
        >
          {name}
        </h2>
        <h3>{description}</h3>
      </div>
      <div className="flex gap-2">
        <Link href={`/dashboard/${guildId}/commands/${commandId}`}>
          <div
            className={`hover:cursor-pointer ${
              disabled ? 'text-gray-700' : ''
            }`}
          >
            Edit
          </div>
        </Link>
        <Switch
          disabled={disableSwitch}
          checked={!disabled}
          onChange={() => {
            setDisableSwitch(true);
            handleToggle(!disabled);
          }}
          className={`${
            disabled ? 'bg-gray-400' : 'bg-blue-600'
          } relative inline-flex h-6 w-11 items-center rounded-full`}
        >
          {' '}
          <span className="sr-only">Enable or disable command</span>
          <span
            aria-hidden="true"
            className={`${
              disabled ? 'translate-x-1' : 'translate-x-6'
            } inline-block h-4 w-4 transform rounded-full bg-white transition duration-200 ease-in-out`}
          />
        </Switch>
      </div>
    </div>
  );
};

export default CommandInfo;
