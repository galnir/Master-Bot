import { z } from 'zod';

import { createTRPCRouter, publicProcedure } from '../trpc';

export const reminderRouter = createTRPCRouter({
	getAll: publicProcedure.query(async ({ ctx }) => {
		const reminders = await ctx.prisma.reminder.findMany();

		return { reminders };
	}),
	getReminder: publicProcedure
		.input(
			z.object({
				userId: z.string(),
				event: z.string()
			})
		)
		.mutation(async ({ ctx, input }) => {
			const { userId, event } = input;

			const reminder = await ctx.prisma.reminder.findFirst({
				where: {
					userId,
					event
				},
				include: { user: true }
			});

			return { reminder };
		}),
	getByUserId: publicProcedure
		.input(
			z.object({
				userId: z.string()
			})
		)
		.mutation(async ({ ctx, input }) => {
			const { userId } = input;

			const reminders = await ctx.prisma.reminder.findMany({
				where: {
					userId
				},
				select: {
					event: true,
					dateTime: true,
					description: true
				},
				orderBy: {
					id: 'asc'
				}
			});

			return { reminders };
		}),
	create: publicProcedure
		.input(
			z.object({
				userId: z.string(),
				event: z.string(),
				description: z.nullable(z.string()),
				dateTime: z.string(),
				repeat: z.nullable(z.string()),
				timeOffset: z.number()
			})
		)
		.mutation(async ({ ctx, input }) => {
			const { userId, event, description, dateTime, repeat, timeOffset } =
				input;

			const reminder = await ctx.prisma.reminder.create({
				data: {
					event,
					description,
					dateTime,
					repeat,
					timeOffset,
					user: { connect: { discordId: userId } }
				}
			});

			return { reminder };
		}),
	delete: publicProcedure
		.input(
			z.object({
				userId: z.string(),
				event: z.string()
			})
		)
		.mutation(async ({ ctx, input }) => {
			const { userId, event } = input;

			const reminder = await ctx.prisma.reminder.deleteMany({
				where: {
					userId,
					event
				}
			});

			return { reminder };
		})
});
