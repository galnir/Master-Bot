'use client';

import Link from 'next/link';
import { Button } from '~/components/ui/button';
import { api } from '~/utils/api';
import { env } from '~/env.mjs';

export default function GuildsList() {
	const { data, isLoading, isError } = api.guild.getAll.useQuery(undefined, {
		refetchOnReconnect: false,
		retryOnMount: false,
		refetchOnWindowFocus: false
	});

	if (isLoading) return <div className="text-white">Loading...</div>;

	if (isError) return <div className="text-white">Error</div>;

	return (
		<>
			{data ? (
				<div className="flex gap-14">
					{data.apiGuilds.map(guild => (
						<div
							className="text-white flex flex-col items-center"
							key={guild.id}
						>
							<p className="font-semibold text-lg">{guild.name}</p>
							{data.dbGuildsIds.includes(guild.id) ? (
								<Button
									className="bg-orange-500 hover:bg-orange-600 text-white"
									asChild
								>
									<Link href={`/dashboard/${guild.id}`}>Manage</Link>
								</Button>
							) : (
								<Button variant="link" asChild>
									<a
										href={env.NEXT_PUBLIC_INVITE_URL}
										target="_blank"
										rel="noreferrer"
									>
										Invite
									</a>
								</Button>
							)}
						</div>
					))}
				</div>
			) : (
				<div>
					<p className="text-white">You do not own a Discord server</p>
				</div>
			)}
		</>
	);
}
