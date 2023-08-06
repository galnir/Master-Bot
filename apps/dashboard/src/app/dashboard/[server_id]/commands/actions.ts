'use server';
import { prisma } from '@master-bot/db';
import { revalidatePath } from 'next/cache';

export async function toggleCommand(
	guildId: string,
	commandId: string,
	newStatus: boolean
) {
	const guild = await prisma.guild.findUnique({
		where: {
			id: guildId
		},
		select: {
			disabledCommands: true
		}
	});

	if (!guild) {
		throw new Error('Guild not found');
	}

	if (newStatus) {
		await prisma.guild.update({
			where: {
				id: guildId
			},
			data: {
				disabledCommands: {
					set: guild.disabledCommands.filter(id => id !== commandId)
				}
			}
		});
	} else {
		await prisma.guild.update({
			where: {
				id: guildId
			},
			data: {
				disabledCommands: {
					push: commandId
				}
			}
		});
	}

	revalidatePath(`/dashboard/${guildId}/commands`);
}
