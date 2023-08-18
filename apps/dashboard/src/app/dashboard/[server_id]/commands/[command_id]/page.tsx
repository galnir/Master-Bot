'use client';
import {
	type APIRole,
	type APIApplicationCommandPermission,
	ApplicationCommandPermissionType
} from 'discord-api-types/v10';
import { useState } from 'react';
import { api } from '~/utils/api';
import { useToast } from '~/components/ui/use-toast';
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuGroup,
	DropdownMenuItem,
	DropdownMenuTrigger
} from '~/components/ui/dropdown';

interface Role {
	name: string;
	id: string;
	color: number;
}

export default function CommandPage({
	params
}: {
	params: {
		server_id: string;
		command_id: string;
	};
}) {
	const { data, isLoading } = api.command.getCommandAndGuildChannels.useQuery(
		{
			guildId: params.server_id,
			commandId: params.command_id
		},
		{
			refetchOnReconnect: false,
			retryOnMount: false,
			refetchOnWindowFocus: false
		}
	);

	if (isLoading) return <div>Loading...</div>;

	if (!data?.command) return <div>Command not found</div>;

	return (
		<>
			<h1 className="text-3xl font-semibold mb-4">Edit {data.command.name}</h1>
			<PermissionsEdit
				roles={sortRolePermissions({
					roles: data.roles,
					permissions: data.permissions
				})}
				allRoles={data.roles}
				guildId={params.server_id}
				commandId={params.command_id}
			/>
		</>
	);
}

const PermissionsEdit = ({
	roles,
	allRoles,
	guildId,
	commandId
}: {
	roles: {
		allowedRoles: Role[];
		deniedRoles: Role[];
	};
	allRoles: APIRole[];
	guildId: string;
	commandId: string;
}) => {
	const { toast } = useToast();

	const allowedIds = roles.allowedRoles.map(r => r.id);
	const deniedIds = roles.deniedRoles.map(r => r.id);

	const [allowedRoles, setAllowedRoles] = useState(roles.allowedRoles);
	const [deniedRoles, setDeniedRoles] = useState(roles.deniedRoles);

	const [disableSave, setDisableSave] = useState(false);

	const [selectedRadio, setSelectedRadio] = useState(
		allowedIds.length ? 'deny' : 'allow'
	);
	const isRadioSelected = (value: string) => selectedRadio === value;

	const handleRadioClick = (e: React.ChangeEvent<HTMLInputElement>): void =>
		setSelectedRadio(e.currentTarget.value);

	const { mutate } = api.command.editCommandPermissions.useMutation();
	const utils = api.useContext();

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
				permissions: selectedRadio === 'allow' ? deniedPerms : allowedPerms,
				type: selectedRadio
			},
			{
				onSuccess: async () => {
					await utils.command.getCommandAndGuildChannels.invalidate();
					setDisableSave(false);
					toast({
						title: 'Permissions updated'
					});
				},
				onError: () => {
					setDisableSave(false);
					toast({
						title: 'An error occurred while updating permissions.'
					});
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
					<div className="flex gap-2">
						<input
							type="radio"
							checked={isRadioSelected('allow')}
							value="allow"
							name="role"
							onChange={handleRadioClick}
						/>
						<h1>Allow for everyone except</h1>
					</div>
					{selectedRadio === 'deny' ? null : (
						<div className="max-w-[320px] flex gap-4 flex-wrap bg-black rounded-lg">
							{deniedRoles.map(role => {
								if (role.name === '@everyone') return null;
								return (
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
								);
							})}
							<DropdownMenu>
								<DropdownMenuTrigger asChild>
									<button
										type="button"
										className={`p-2 text-white hover:cursor-pointer`}
									>
										+
									</button>
								</DropdownMenuTrigger>
								<DropdownMenuContent className="w-56 h-96 overflow-auto">
									<DropdownMenuGroup>
										{allRoles
											.filter(role => !deniedIds.includes(role.id))
											.map(role => {
												if (role.name === '@everyone') return;

												return (
													<DropdownMenuItem
														className="h-6 dark:text-white"
														key={role.id}
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
														}}
													>
														{role.name}
													</DropdownMenuItem>
												);
											})}
									</DropdownMenuGroup>
								</DropdownMenuContent>
							</DropdownMenu>
						</div>
					)}
				</div>
				<div className="w-fit">
					<div className="flex gap-2">
						<input
							type="radio"
							checked={isRadioSelected('deny')}
							value="deny"
							name="role"
							onChange={handleRadioClick}
						/>
						<h1>Deny for everyone except</h1>
					</div>
					{selectedRadio === 'deny' ? (
						<div className="max-w-[320px] flex gap-4 flex-wrap bg-black rounded-lg">
							{allowedRoles.map(role => {
								if (role.name == '@everyone') return null;
								return (
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
										{role.name == '@everyone' ? '@everyone' : `@${role.name}`}
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
								);
							})}
							<DropdownMenu>
								<DropdownMenuTrigger asChild>
									<button
										type="button"
										className={`p-2 text-white hover:cursor-pointer`}
									>
										+
									</button>
								</DropdownMenuTrigger>
								<DropdownMenuContent className="w-56 h-96 overflow-auto">
									<DropdownMenuGroup>
										{allRoles
											.filter(role => !allowedIds.includes(role.id))
											.map(role => {
												if (role.name === '@everyone') return;

												return (
													<DropdownMenuItem
														className="h-6 dark:text-white"
														key={role.id}
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
														}}
													>
														{role.name}
													</DropdownMenuItem>
												);
											})}
									</DropdownMenuGroup>
								</DropdownMenuContent>
							</DropdownMenu>
						</div>
					) : null}
				</div>
			</div>
		</div>
	);
};

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
				permission.type === ApplicationCommandPermissionType.Role &&
				permission.permission
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
				permission.type === ApplicationCommandPermissionType.Role &&
				!permission.permission
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
