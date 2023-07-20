import { z } from 'zod';

import { createTRPCRouter, publicProcedure } from '../trpc';

export const songRouter = createTRPCRouter({
	createMany: publicProcedure
		.input(
			z.object({
				songs: z.array(z.any())
			})
		)
		.mutation(async ({ ctx, input }) => {
			const { songs } = input;

			const songsCreated = await ctx.prisma.song.createMany({
				data: songs
			});

			return { songsCreated };
		}),
	delete: publicProcedure
		.input(
			z.object({
				id: z.number()
			})
		)
		.mutation(async ({ ctx, input }) => {
			const { id } = input;

			const song = await ctx.prisma.song.delete({
				where: {
					id: id
				}
			});

			return { song };
		})
});
