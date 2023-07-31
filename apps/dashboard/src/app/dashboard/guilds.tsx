'use client';

import { api } from '~/utils/api';

export default function GuildsList() {
	const [data] = api.guild.getAll.useSuspenseQuery();

	return (
		<div>
			<h1>Servers</h1>
			<h2>aa</h2>
		</div>
	);
}
