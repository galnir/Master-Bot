import { prisma } from '@master-bot/db';
import WelcomeMessageToggle from './switch';
import { setWelcomeMessage } from './actions';
import { Button } from '~/components/ui/button';
import WelcomeMessageChannelSet from './set-channel';

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
			<div className="ml-2 mt-6 flex flex-col gap-6">
				<h3>Welcome new users with a custom message</h3>
				<div className="flex items-center gap-5">
					{guild.welcomeMessageEnabled ? (
						<p className="text-green-500">Enabled</p>
					) : (
						<p className="text-red-500">Disabled</p>
					)}
					<WelcomeMessageToggle
						welcomeMessageEnabled={guild.welcomeMessageEnabled}
						serverId={params.server_id}
					/>
				</div>
				{guild.welcomeMessageEnabled && (
					<div className="flex flex-col gap-4">
						<form action={setWelcomeMessage}>
							<input type="hidden" name="guildId" value={params.server_id} />
							<textarea
								name="message"
								placeholder="welcome message"
								defaultValue={guild.welcomeMessage ?? ''}
								className="block mb-2 -ml-1 w-full bg-black outline-none overflow-auto my-2 resize-none p-4 text-white rounded-lg border border-gray-800 focus:ring-blue-600 focus:border-blue-600"
							/>
							<Button type="submit">Submit</Button>
						</form>
						<WelcomeMessageChannelSet guildId={params.server_id} />
					</div>
				)}
			</div>
		</>
	);
}
