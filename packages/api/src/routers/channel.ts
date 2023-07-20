import { getFetch } from '@trpc/client';
import type {
	APIGuildChannel,
	APIGuildTextChannel
} from 'discord-api-types/v10';
import { z } from 'zod';

import { env } from '../env.mjs';
import { createTRPCRouter, publicProcedure } from '../trpc';

const fetch = getFetch();

export const channelRouter = createTRPCRouter({
	getAll: publicProcedure
		.input(
			z.object({
				guildId: z.string()
			})
		)
		.query(async ({ input }) => {
			const { guildId } = input;

			const token = env.DISCORD_TOKEN;

			// call the discord api with the token and the guildId and get all the guild's text channels
			const response = await fetch(
				`https://discordapp.com/api/guilds/${guildId}/channels`,
				{
					headers: {
						Authorization: `Bot ${token}`
					}
				}
			);
			const responseChannels =
				(await response.json()) as APIGuildChannel<any>[];

			const channels: APIGuildTextChannel<0>[] = responseChannels.filter(
				channel => channel.type === 0
			);
			return { channels };
		})
});
