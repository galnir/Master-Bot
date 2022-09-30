import { t } from '../trpc';
import { z } from 'zod';

export const playlistRouter = t.router({
  getPlaylist: t.procedure
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
  getAll: t.procedure
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
  create: t.procedure
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
  delete: t.procedure
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
