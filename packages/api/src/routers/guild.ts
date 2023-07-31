import { getFetch } from '@trpc/client';
import { TRPCError } from '@trpc/server';
import type { APIGuild, APIRole } from 'discord-api-types/v10';
import { z } from 'zod';
import { createTRPCRouter, protectedProcedure, publicProcedure } from '../trpc';
import { discordApi } from '../utils/axiosWithRefresh';
import { env } from '../env.mjs';

const fetch = getFetch();

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
	getGuildFromAPI: protectedProcedure
		.input(
			z.object({
				guildId: z.string()
			})
		)
		.query(async ({ input }) => {
			const token = env.DISCORD_TOKEN;
			const { guildId } = input;

			try {
				const response = await fetch(
					`https://discord.com/api/guilds/${guildId}`,
					{
						headers: {
							Authorization: `Bot ${token}`
						}
					}
				);

				const guild = (await response.json()) as APIGuild;

				return { guild };
			} catch {
				throw new TRPCError({
					message: 'Not Found',
					code: 'NOT_FOUND'
				});
			}
		}),
	getGuildAndUser: publicProcedure
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

			const user = await ctx.prisma.user.findUnique({
				where: {
					id: ctx.session?.user?.id
				}
			});

			if (guild?.ownerId !== user?.discordId) {
				throw new TRPCError({
					message: 'UNAUTHORIZED',
					code: 'UNAUTHORIZED'
				});
			}

			return { guild, user };
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
	createViaTwitchNotification: publicProcedure
		.input(
			z.object({
				guildId: z.string(),
				userId: z.string(),
				ownerId: z.string(),
				name: z.string(),
				notifyList: z.array(z.string())
			})
		)
		.mutation(async ({ ctx, input }) => {
			const { guildId, userId, ownerId, name, notifyList } = input;
			await ctx.prisma.guild.upsert({
				create: {
					id: guildId,
					notifyList: [userId],
					volume: 100,
					ownerId: ownerId,
					name: name
				},
				select: { notifyList: true },
				update: {
					notifyList
				},
				where: { id: guildId }
			});
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
	updateWelcomeMessage: publicProcedure
		.input(
			z.object({
				guildId: z.string(),
				welcomeMessage: z.string().nullable(),
				welcomeMessageEnabled: z.boolean().nullable()
			})
		)
		.mutation(async ({ ctx, input }) => {
			const { guildId, welcomeMessage, welcomeMessageEnabled } = input;

			const guild = await ctx.prisma.guild.update({
				where: {
					id: guildId
				},
				data: {
					// undefined means do nothing, null will set the value to null
					welcomeMessage: welcomeMessage ? welcomeMessage : undefined,
					welcomeMessageEnabled: welcomeMessageEnabled
						? welcomeMessageEnabled
						: undefined
				}
			});

			return { guild };
		}),
	toggleWelcomeMessage: publicProcedure
		.input(
			z.object({
				status: z.boolean(),
				guildId: z.string()
			})
		)
		.mutation(async ({ ctx, input }) => {
			const { status, guildId } = input;

			const guild = await ctx.prisma.guild.update({
				where: {
					id: guildId
				},
				data: {
					welcomeMessageEnabled: status
				}
			});

			return { guild };
		}),
	updateWelcomeMessageChannel: publicProcedure
		.input(
			z.object({
				guildId: z.string(),
				channelId: z.string()
			})
		)
		.mutation(async ({ ctx, input }) => {
			const { guildId, channelId } = input;

			const guild = await ctx.prisma.guild.update({
				where: {
					id: guildId
				},
				data: {
					welcomeMessageChannel: channelId
				}
			});

			return { guild };
		}),
	getAll: protectedProcedure.query(async ({ ctx }) => {
		const account = await ctx.prisma.account.findFirst({
			where: {
				userId: ctx.session?.user?.id
			}
		});

		if (!account?.access_token) {
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

			const response = await discordApi.get('/users/@me/guilds', {
				headers: {
					Authorization: `Bearer ${account.access_token}`,
					'X-User-Id': ctx.session.user.id,
					'X-Refresh-Token': account.refresh_token
				}
			});

			const apiGuilds = response.data as APIGuild[];

			const apiGuildsOwns = apiGuilds.filter(guild => guild.owner);

			return {
				apiGuilds: apiGuildsOwns,
				dbGuilds
			};
		} catch (e) {
			console.error(e);
			throw new TRPCError({
				code: 'INTERNAL_SERVER_ERROR',
				message: 'Something went wrong when trying to fetch guilds'
			});
		}
	}),
	updateTwitchNotifications: publicProcedure
		.input(
			z.object({
				guildId: z.string(),
				notifyList: z.array(z.string())
			})
		)
		.mutation(async ({ ctx, input }) => {
			const { guildId, notifyList } = input;

			await ctx.prisma.guild.update({
				where: { id: guildId },
				data: { notifyList }
			});
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
		})
});
