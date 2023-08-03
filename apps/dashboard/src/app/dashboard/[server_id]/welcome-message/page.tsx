import { prisma } from '@master-bot/db';
import ToggleSwitch from './switch';

function getGuildById(id: string) {
	return prisma.guild.findUnique({
		where: {
			id
		}
	});
}

export default async function WelcomeMessagePage({
	params
}: {
	params: { server_id: string };
}) {
	const guild = await getGuildById(params.server_id);

	if (!guild) {
		return <div>Error loading guild</div>;
	}

	return (
		<>
			<h1 className="text-3xl font-semibold">Welcome Message Settings</h1>
			<div className="ml-2 mt-6">
				<h3>Welcome new users with a custom message</h3>
				<div className="flex items-center gap-5 mt-6">
					{guild.welcomeMessageEnabled ? (
						<p className="text-green-500">Enabled</p>
					) : (
						<p className="text-red-500">Disabled</p>
					)}
					<ToggleSwitch
						welcomeMessageEnabled={guild.welcomeMessageEnabled}
						serverId={params.server_id}
					/>
				</div>
			</div>
		</>
	);
}
