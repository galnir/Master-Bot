import { z } from 'zod';

import { createTRPCRouter, publicProcedure } from '../trpc';

export const userRouter = createTRPCRouter({
	getUserById: publicProcedure
		.input(
			z.object({
				id: z.string()
			})
		)
		.query(async ({ ctx, input }) => {
			const { id } = input;

			const user = await ctx.prisma.user.findUnique({
				where: {
					discordId: id
				}
			});

			return { user };
		}),
	create: publicProcedure
		.input(
			z.object({
				id: z.string(),
				name: z.string()
			})
		)
		.mutation(async ({ ctx, input }) => {
			const { id, name } = input;
			const user = await ctx.prisma.user.upsert({
				where: {
					discordId: id
				},
				update: {},
				create: {
					discordId: id,
					name
				}
			});
			return { user };
		}),
	delete: publicProcedure
		.input(
			z.object({
				id: z.string()
			})
		)
		.mutation(async ({ ctx, input }) => {
			const { id } = input;

			const user = await ctx.prisma.user.delete({
				where: {
					discordId: id
				}
			});

			return { user };
		}),
	updateTimeOffset: publicProcedure
		.input(
			z.object({
				id: z.string(),
				timeOffset: z.number()
			})
		)
		.mutation(async ({ ctx, input }) => {
			const { id, timeOffset } = input;
			const userTime = await ctx.prisma.user.update({
				where: {
					discordId: id
				},
				data: { timeOffset: timeOffset },
				select: { timeOffset: true }
			});

			return { userTime };
		})
});
