'use server';
import { prisma } from '@master-bot/db';
import { revalidatePath } from 'next/cache';

export async function toggleWelcomeMessage(status: boolean, server_id: string) {
	'use server';

	await prisma.guild.update({
		where: {
			id: server_id
		},
		data: {
			welcomeMessageEnabled: status
		}
	});

	revalidatePath(`/dashboard/${server_id}/welcome-message`);
}
