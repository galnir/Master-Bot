import { t } from '../trpc';
import { z } from 'zod';

export const songRouter = t.router({
  createMany: t.procedure
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
  delete: t.procedure
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
