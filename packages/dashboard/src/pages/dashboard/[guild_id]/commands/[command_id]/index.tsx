import { useState } from 'react';
import { GetServerSideProps, GetServerSidePropsContext } from 'next';
import { ReactElement } from 'react';
import DashboardLayout from '../../../../../components/DashboardLayout';
import { getServerSession } from '../../../../../shared/get-server-session';
import { NextPageWithLayout } from '../../../../_app';
import { trpc } from '../../../../../utils/trpc';
import { useRouter } from 'next/router';
import { CommandType } from '@master-bot/api/src/routers/command';
import {
  APIGuildChannel,
  ChannelType,
  APIRole,
  APIApplicationCommandPermission
} from 'discord-api-types/v10';

type Role = { name: string; id: string; color: number };

const CommandPage: NextPageWithLayout = () => {
  const router = useRouter();
  const guildId = router.query.guild_id;
  const commandId = router.query.command_id;

  if (
    !guildId ||
    typeof guildId !== 'string' ||
    !commandId ||
    typeof commandId !== 'string'
  ) {
    router.push('/');
    return <></>;
  }

  const { data, isLoading, error } =
    trpc.command.getCommandAndGuildChannels.useQuery(
      {
        commandId,
        guildId
      },
      { refetchOnWindowFocus: false }
    );

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (error?.data?.code === 'UNAUTHORIZED') {
    return <div>{error.message}</div>;
  }

  if (!data || data?.command.code == 10063) {
    return <div>This command ID is invalid!</div>;
  }

  return (
    <CommandPageComponent
      command={data.command}
      channels={data.channels}
      roles={data.roles}
      permissions={data.permissions}
    />
  );
};

const CommandPageComponent = ({
  command,
  roles,
  channels,
  permissions
}: {
  command: CommandType;
  roles: APIRole[];
  channels: APIGuildChannel<ChannelType>[];
  permissions: any;
}) => {
  return (
    <div className="p-5">
      <h1 className="font-bold text-2xl mb-10">Edit /{command.name}</h1>
      <PermissionsEdit
        allRoles={roles}
        roles={sortRolePermissions({ roles, permissions })}
      />
    </div>
  );
};

const PermissionsEdit = ({
  roles,
  allRoles
}: {
  roles: {
    allowedRoles: Role[];
    deniedRoles: Role[];
  };
  allRoles: APIRole[];
}) => {
  const router = useRouter();
  const guildId = router.query.guild_id as string;
  const commandId = router.query.command_id as string;

  const allowedIds = roles.allowedRoles.map(r => r.id);
  const deniedIds = roles.deniedRoles.map(r => r.id);

  const [allowedRoles, setAllowedRoles] = useState(roles.allowedRoles);
  const [deniedRoles, setDeniedRoles] = useState(roles.deniedRoles);

  const [disableSave, setDisableSave] = useState(false);

  const [openAllowModal, setOpenAllowModal] = useState(false);
  const [openDenyModal, setOpenDenyModal] = useState(false);

  const { mutate } = trpc.command.editCommandPermissions.useMutation();
  const utils = trpc.useContext();

  function handleRoleChange({ id, type }: { id: string; type: string }) {
    if (type === 'allow') {
      const newAllowedRoles = allowedRoles.filter(role => role.id !== id);
      setAllowedRoles(newAllowedRoles);
    } else if (type === 'deny') {
      const newDeniedRoles = deniedRoles.filter(role => role.id !== id);
      setDeniedRoles(newDeniedRoles);
    }
  }

  function handleSave() {
    setDisableSave(true);
    const allowedPerms = allowedRoles.map(role => ({
      id: role.id,
      type: 1,
      permission: true
    }));

    const deniedPerms = deniedRoles.map(role => ({
      id: role.id,
      type: 1,
      permission: false
    }));

    mutate(
      {
        guildId,
        commandId,
        permissions: [...allowedPerms, ...deniedPerms]
      },
      {
        onSuccess: () => {
          utils.command.getCommandAndGuildChannels.invalidate();
          setDisableSave(false);
        },
        onError: () => {
          setDisableSave(false);
        },
        onSettled: () => {
          setDisableSave(false);
        }
      }
    );
  }

  return (
    <div className="bg-gray-900 p-5 rounded-lg">
      <div className="flex justify-between">
        <h1 className="text-slate-300 font-bold text-xl">Permissions</h1>
        <button
          disabled={disableSave}
          onClick={handleSave}
          className="bg-green-600 text-white rounded-lg px-3 py-1 hover:bg-green-500"
        >
          Save
        </button>
      </div>
      <div className="mt-10 flex flex-col gap-4">
        <h2 className="font-bold text-slate-300">Role permissions</h2>
        <div className="w-fit">
          <h1>Deny for</h1>
          <div className="max-w-[320px] flex gap-4 flex-wrap bg-black rounded-lg">
            {deniedRoles.map(role => (
              <div
                key={role.id}
                style={{
                  backgroundColor:
                    role.color.toString(16) == '0'
                      ? 'gray'
                      : `#${role.color.toString(16)}`
                }}
                className={`flex rounded-lg px-2 py-1 text-white items-center`}
              >
                <div>
                  {role.name == '@everyone' ? '@everyone' : `@${role.name}`}
                </div>
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  className="cursor-pointer ml-1"
                  onClick={() =>
                    handleRoleChange({ id: role.id, type: 'allow' })
                  }
                >
                  <path
                    d="M7.757 7.757l8.486 8.486m0-8.486l-8.486 8.486"
                    stroke="#9B9D9F"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                  ></path>
                </svg>
              </div>
            ))}
            <div className="relative">
              <div
                className={`p-2 text-white hover:cursor-pointer ${
                  openDenyModal ? 'text-blue-700' : ''
                }`}
                onClick={() => setOpenDenyModal(state => !state)}
              >
                +
              </div>
              {openDenyModal ? (
                <div className="absolute z-10 left-0 bg-white p-2 border border-blue-900">
                  <div className="flex flex-col gap-2 w-44 max-h-96 overflow-auto">
                    {allRoles
                      .filter(role => !deniedIds.includes(role.id))
                      .map(role => {
                        return (
                          <div
                            onClick={() => {
                              setDeniedRoles(state => [
                                ...state,
                                {
                                  id: role.id,
                                  name: role.name,
                                  color: role.color
                                }
                              ]);
                              if (allowedIds.includes(role.id)) {
                                setAllowedRoles(state =>
                                  state.filter(r => r.id !== role.id)
                                );
                              }
                              setOpenDenyModal(false);
                            }}
                            className="hover:bg-slate-700 hover:cursor-pointer"
                            key={role.id}
                          >
                            {role.name}
                          </div>
                        );
                      })}
                  </div>
                </div>
              ) : null}
            </div>
          </div>
        </div>
        <div className="w-fit">
          <div>Allow for</div>
          <div className="p-2 max-w-[320px] flex gap-4 flex-wrap bg-black rounded-lg">
            {allowedRoles.map(role => (
              <div
                key={role.id}
                style={{
                  backgroundColor:
                    role.color.toString(16) == '0'
                      ? 'gray'
                      : `#${role.color.toString(16)}`
                }}
                className={`flex rounded-lg px-2 py-1 text-white items-center`}
              >
                <div>@{role.name}</div>
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  className="cursor-pointer ml-1"
                  onClick={() =>
                    handleRoleChange({ id: role.id, type: 'deny' })
                  }
                >
                  <path
                    d="M7.757 7.757l8.486 8.486m0-8.486l-8.486 8.486"
                    stroke="#9B9D9F"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                  ></path>
                </svg>
              </div>
            ))}
            <div className="relative">
              <div
                className={`p-2 text-white hover:cursor-pointer ${
                  openAllowModal ? 'text-blue-700' : ''
                }`}
                onClick={() => setOpenAllowModal(state => !state)}
              >
                +
              </div>
              {openAllowModal ? (
                <div className="absolute z-10 left-0 bg-white p-2 border border-blue-900">
                  <div className="flex flex-col gap-2 w-44 max-h-96 overflow-auto">
                    {allRoles
                      .filter(role => !allowedIds.includes(role.id))
                      .map(role => {
                        return (
                          <div
                            onClick={() => {
                              setAllowedRoles(state => [
                                ...state,
                                {
                                  id: role.id,
                                  name: role.name,
                                  color: role.color
                                }
                              ]);
                              if (deniedIds.includes(role.id)) {
                                setDeniedRoles(state =>
                                  state.filter(r => r.id !== role.id)
                                );
                              }

                              setOpenAllowModal(false);
                            }}
                            className="hover:bg-slate-700 hover:cursor-pointer"
                            key={role.id}
                          >
                            {role.name}
                          </div>
                        );
                      })}
                  </div>
                </div>
              ) : null}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

CommandPage.getLayout = function getLayout(page: ReactElement) {
  return <DashboardLayout>{page}</DashboardLayout>;
};

export const getServerSideProps: GetServerSideProps = async (
  ctx: GetServerSidePropsContext
) => {
  const session = await getServerSession(ctx);

  if (!session || !session.user || !session.user.id) {
    return {
      redirect: { destination: '../../api/auth/signin', permanent: false },
      props: {}
    };
  }

  return {
    props: {
      session
    }
  };
};

export default CommandPage;

function sortRolePermissions({
  roles,
  permissions
}: {
  roles: APIRole[];
  permissions: any;
}) {
  if (permissions.code) {
    return {
      allowedRoles: [],
      deniedRoles: []
    };
  }

  const allowedRoles: Role[] = permissions.permissions
    .filter(
      (permission: APIApplicationCommandPermission) =>
        permission.type === 1 && permission.permission
    )
    .map((permission: APIApplicationCommandPermission) => {
      const role = roles.find(roles => roles.id === permission.id);

      return {
        name: role?.name,
        id: role?.id,
        color: role?.color
      };
    });

  const deniedRoles: Role[] = permissions.permissions
    .filter(
      (permission: APIApplicationCommandPermission) =>
        permission.type === 1 && !permission.permission
    )
    .map((permission: APIApplicationCommandPermission) => {
      const role = roles.find(roles => roles.id === permission.id);

      return {
        name: role?.name,
        id: role?.id,
        color: role?.color
      };
    });

  return {
    allowedRoles,
    deniedRoles
  };
}
