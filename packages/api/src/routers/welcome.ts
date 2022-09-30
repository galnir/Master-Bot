import { t } from '../trpc';
import { z } from 'zod';

export const welcomeRouter = t.router({
  getMessage: t.procedure
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
  setMessage: t.procedure
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
  setChannel: t.procedure
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
  getChannel: t.procedure
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
  getStatus: t.procedure
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
  toggle: t.procedure
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
