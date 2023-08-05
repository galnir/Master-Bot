'use server';
import { prisma } from '@master-bot/db';
import { revalidatePath } from 'next/cache';

export async function toggleWelcomeMessage(status: boolean, server_id: string) {
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

export async function setWelcomeMessage(data: FormData) {
	const guildId = data.get('guildId') as string;
	const message = data.get('message') as string;

	await prisma.guild.update({
		where: {
			id: guildId
		},
		data: {
			welcomeMessage: message
		}
	});

	revalidatePath(`/dashboard/${guildId}/welcome-message`);
}
