import { auth } from '@master-bot/auth';
import { redirect } from 'next/navigation';
import { prisma } from '@master-bot/db';

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

	return <main>{children}</main>;
}
