import { z } from 'zod';

import { createTRPCRouter, publicProcedure } from '../trpc';

export const welcomeRouter = createTRPCRouter({
	getMessage: publicProcedure
		.input(
			z.object({
				guildId: z.string()
			})
		)
		.query(async ({ ctx, input }) => {
			const { guildId } = input;

			const guild = await ctx.prisma.guild.findUnique({
				where: {
					id: guildId
				}
			});

			return {
				message: guild?.welcomeMessage
			};
		}),
	setMessage: publicProcedure
		.input(
			z.object({
				message: z.string().min(4).max(100),
				guildId: z.string()
			})
		)
		.mutation(async ({ ctx, input }) => {
			const { message, guildId } = input;

			const guild = await ctx.prisma.guild.update({
				where: {
					id: guildId
				},
				data: {
					welcomeMessage: message
				}
			});

			return { guild };
		}),
	setChannel: publicProcedure
		.input(
			z.object({
				channelId: z.string(),
				guildId: z.string()
			})
		)
		.mutation(async ({ ctx, input }) => {
			const { channelId, guildId } = input;

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
	getChannel: publicProcedure
		.input(
			z.object({
				guildId: z.string()
			})
		)
		.query(async ({ ctx, input }) => {
			const { guildId } = input;

			const guild = await ctx.prisma.guild.findUnique({
				where: {
					id: guildId
				},
				select: {
					welcomeMessageChannel: true
				}
			});

			return { guild };
		}),
	getStatus: publicProcedure
		.input(
			z.object({
				guildId: z.string()
			})
		)
		.query(async ({ ctx, input }) => {
			const { guildId } = input;

			const guild = await ctx.prisma.guild.findUnique({
				where: {
					id: guildId
				},
				select: {
					welcomeMessageEnabled: true
				}
			});

			return { guild };
		}),
	toggle: publicProcedure
		.input(
			z.object({
				guildId: z.string(),
				status: z.boolean()
			})
		)
		.mutation(async ({ ctx, input }) => {
			const { guildId, status } = input;

			const guild = await ctx.prisma.guild.update({
				where: {
					id: guildId
				},
				data: {
					welcomeMessageEnabled: status
				}
			});

			return { guild };
		})
});
