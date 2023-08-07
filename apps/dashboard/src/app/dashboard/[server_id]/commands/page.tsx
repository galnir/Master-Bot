import { env } from '~/env.mjs';
import { prisma } from '@master-bot/db';
import type { APIApplicationCommand } from 'discord-api-types/v10';
import CommandToggleSwitch from './toggle-command';
import Link from 'next/link';

async function getApplicationCommands() {
	// get all commands
	const response = await fetch(
		`https://discordapp.com/api/applications/${env.DISCORD_CLIENT_ID}/commands`,
		{
			headers: {
				Authorization: `Bot ${env.DISCORD_TOKEN}`
			}
		}
	);

	return (await response.json()) as APIApplicationCommand[];
}

export default async function CommandsPage({
	params
}: {
	params: { server_id: string };
}) {
	// get disabled commands
	const guild = await prisma.guild.findUnique({
		where: { id: params.server_id },
		select: { disabledCommands: true }
	});

	const commands = await getApplicationCommands();

	return (
		<div>
			<h1 className="text-3xl font-semibold mb-4">
				Enable / Disable Commands Panel
			</h1>
			{commands ? (
				<div className="flex flex-col gap-4">
					{commands.map(command => {
						const isCommandEnabled = !guild?.disabledCommands.includes(
							command.id
						);
						return (
							<div
								key={command.id}
								className={`${
									isCommandEnabled ? 'bg-slate-700' : 'bg-slate-800'
								} border-b flex justify-between items-center dark:border-slate-400 border-slate-700 px-2 py-1`}
							>
								<div className="flex flex-col gap-1">
									<Link
										href={`/dashboard/${params.server_id}/commands/${command.id}`}
									>
										<h3 className="text-lg">{command.name}</h3>
									</Link>
									<p className="text-sm">{command.description}</p>
								</div>
								<div>
									<CommandToggleSwitch
										commandEnabled={isCommandEnabled}
										serverId={params.server_id}
										commandId={command.id}
									/>
								</div>
							</div>
						);
					})}
				</div>
			) : (
				<div className="text-red-500">Error loading commands</div>
			)}
		</div>
	);
}
