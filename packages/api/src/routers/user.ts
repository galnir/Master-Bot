import { t } from '../trpc';
import { z } from 'zod';

export const userRouter = t.router({
  getUserById: t.procedure
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
  create: t.procedure
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
  delete: t.procedure
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
    })
});
