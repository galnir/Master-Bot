import { getFetch } from '@trpc/client';
import { TRPCError } from '@trpc/server';
import type { APIGuild, APIRole } from 'discord-api-types/v10';
import { z } from 'zod';
import { createTRPCRouter, protectedProcedure, publicProcedure } from '../trpc';
import { discordApi } from '../utils/axiosWithRefresh';

const fetch = getFetch();

function getUserGuilds(
	access_token: string,
	refresh_token: string,
	user_id: string
) {
	return discordApi.get('https://discord.com/api/v10/users/@me/guilds', {
		headers: {
			Authorization: `Bearer ${access_token}`,
			// set user agent
			'User-Agent':
				'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/112.0.0.0 Safari/537.36',
			'X-User-Id': user_id,
			'X-Refresh-Token': refresh_token
		}
	});
}

export const guildRouter = createTRPCRouter({
	getGuild: publicProcedure
		.input(
			z.object({
				id: z.string()
			})
		)
		.query(async ({ ctx, input }) => {
			const { id } = input;

			const guild = await ctx.prisma.guild.findUnique({
				where: {
					id
				}
			});

			return { guild };
		}),
	create: publicProcedure
		.input(
			z.object({
				id: z.string(),
				ownerId: z.string(),
				name: z.string()
			})
		)
		.mutation(async ({ ctx, input }) => {
			const { id, ownerId, name } = input;

			const guild = await ctx.prisma.guild.upsert({
				where: {
					id: id
				},
				update: {},
				create: {
					id: id,
					ownerId: ownerId,
					volume: 100,
					name: name
				}
			});

			return { guild };
		}),
	delete: publicProcedure
		.input(
			z.object({
				id: z.string()
			})
		)
		.mutation(async ({ ctx, input }) => {
			const { id } = input;

			const guild = await ctx.prisma.guild.delete({
				where: {
					id: id
				}
			});

			return { guild };
		}),
	updateVolume: publicProcedure
		.input(
			z.object({
				guildId: z.string(),
				volume: z.number()
			})
		)
		.mutation(async ({ ctx, input }) => {
			const { guildId, volume } = input;

			await ctx.prisma.guild.update({
				where: { id: guildId },
				data: { volume }
			});
		}),
	getRoles: publicProcedure
		.input(
			z.object({
				guildId: z.string()
			})
		)
		.query(async ({ ctx, input }) => {
			const { guildId } = input;
			const token = process.env.DISCORD_TOKEN;

			if (!ctx.session) {
				throw new TRPCError({
					message: 'Not Authenticated',
					code: 'UNAUTHORIZED'
				});
			}

			const response = await fetch(
				`https://discord.com/api/guilds/${guildId}/roles`,
				{
					headers: {
						Authorization: `Bot ${token}`
					}
				}
			);

			const roles = (await response.json()) as APIRole[];

			return { roles };
		}),
	getAll: protectedProcedure.query(async ({ ctx }) => {
		const account = await ctx.prisma.account.findFirst({
			where: {
				userId: ctx.session?.user?.id
			}
		});

		if (!account?.access_token || !account?.refresh_token) {
			throw new TRPCError({
				code: 'NOT_FOUND',
				message: 'Account not found'
			});
		}

		try {
			const dbGuilds = await ctx.prisma.guild.findMany({
				where: {
					ownerId: account.providerAccountId
				}
			});

			const response = await getUserGuilds(
				account.access_token,
				account.refresh_token,
				account.userId
			);

			// get the guilds from response data
			const apiGuilds = response.data as APIGuild[];

			const apiGuildsOwns = apiGuilds.filter(guild => guild.owner);

			return {
				apiGuilds: apiGuildsOwns,
				dbGuilds,
				apiGuildsIds: apiGuildsOwns.map(guild => guild.id),
				dbGuildsIds: dbGuilds.map(guild => guild.id)
			};
		} catch (error) {
			throw new TRPCError({
				code: 'INTERNAL_SERVER_ERROR',
				message: 'Something went wrong when trying to fetch guilds from DB'
			});
		}
	})
});
