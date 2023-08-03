import { auth } from '@master-bot/auth';
import { redirect } from 'next/navigation';
import { prisma } from '@master-bot/db';
import Sidebar from './sidebar';
import HeaderButtons from '~/components/header-buttons';

export default async function Layout({
	params,
	children
}: {
	params: { server_id: string };
	children: React.ReactNode;
}) {
	const session = await auth();

	if (!session?.user) {
		redirect('/');
	}

	const guild = await prisma.guild.findUnique({
		where: {
			id: params.server_id,
			ownerId: session.user.discordId
		}
	});

	if (!guild) {
		redirect('/');
	}

	return (
		<div className="flex h-screen">
			<section className="border-r border-slate-600 px-6 py-4">
				<Sidebar server_id={params.server_id} />
			</section>
			<section className="flex-1 flex flex-col">
				<header className="flex justify-end px-6 py-4">
					<HeaderButtons />
				</header>
				<main className="bg-slate-800 flex-1 p-8">{children}</main>
			</section>
		</div>
	);
}
