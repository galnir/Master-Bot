import { z } from 'zod';

import { createTRPCRouter, publicProcedure } from '../trpc';

export const playlistRouter = createTRPCRouter({
	getPlaylist: publicProcedure
		.input(
			z.object({
				userId: z.string(),
				name: z.string()
			})
		)
		.query(async ({ ctx, input }) => {
			const { userId, name } = input;

			const playlist = await ctx.prisma.playlist.findFirst({
				where: {
					userId,
					name
				},
				include: {
					songs: true
				}
			});

			return { playlist };
		}),
	getAll: publicProcedure
		.input(
			z.object({
				userId: z.string()
			})
		)
		.query(async ({ ctx, input }) => {
			const { userId } = input;

			const playlists = await ctx.prisma.playlist.findMany({
				where: {
					userId
				},
				include: {
					songs: true
				},
				orderBy: {
					id: 'asc'
				}
			});

			return { playlists };
		}),
	create: publicProcedure
		.input(
			z.object({
				userId: z.string(),
				name: z.string()
			})
		)
		.mutation(async ({ ctx, input }) => {
			const { userId, name } = input;

			const playlist = await ctx.prisma.playlist.create({
				data: {
					name,
					user: {
						connect: {
							id: userId
						}
					}
				}
			});

			return { playlist };
		}),
	delete: publicProcedure
		.input(
			z.object({
				userId: z.string(),
				name: z.string()
			})
		)
		.mutation(async ({ ctx, input }) => {
			const { userId, name } = input;

			const playlist = await ctx.prisma.playlist.deleteMany({
				where: {
					userId,
					name
				}
			});

			return { playlist };
		})
});
