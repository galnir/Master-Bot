import { createRouter } from "../createRouter";
import { z } from "zod";

export const welcomeRouter = createRouter()
  .query("get-message", {
    input: z.object({
      guildId: z.string(),
    }),
    async resolve({ ctx, input }) {
      const { guildId } = input;

      const guild = await ctx.prisma.guild.findUnique({
        where: {
          id: guildId,
        },
      });

      return {
        message: guild?.welcomeMessage,
      };
    },
  })
  .mutation("set-message", {
    input: z.object({
      message: z.string().min(4).max(100),
      guildId: z.string(),
    }),
    async resolve({ ctx, input }) {
      const { message, guildId } = input;

      const guild = await ctx.prisma.guild.update({
        where: {
          id: guildId,
        },
        data: {
          welcomeMessage: message,
        },
      });

      return { guild };
    },
  })
  .mutation("set-channel", {
    input: z.object({
      channelId: z.string(),
      guildId: z.string(),
    }),
    async resolve({ ctx, input }) {
      const { channelId, guildId } = input;

      const guild = await ctx.prisma.guild.update({
        where: {
          id: guildId,
        },
        data: {
          welcomeMessageChannel: channelId,
        },
      });

      return { guild };
    },
  })
  .query("get-channel", {
    input: z.object({
      guildId: z.string(),
    }),
    async resolve({ ctx, input }) {
      const { guildId } = input;

      const guild = await ctx.prisma.guild.findUnique({
        where: {
          id: guildId,
        },
        select: {
          welcomeMessageChannel: true,
        },
      });

      return { guild };
    },
  })
  .query("get-status", {
    input: z.object({
      guildId: z.string(),
    }),
    async resolve({ ctx, input }) {
      const { guildId } = input;

      const guild = await ctx.prisma.guild.findUnique({
        where: {
          id: guildId,
        },
        select: {
          welcomeMessageEnabled: true,
        },
      });

      return { guild };
    },
  })
  .mutation("toggle", {
    input: z.object({
      guildId: z.string(),
      status: z.boolean(),
    }),
    async resolve({ ctx, input }) {
      const { guildId, status } = input;

      const guild = await ctx.prisma.guild.update({
        where: {
          id: guildId,
        },
        data: {
          welcomeMessageEnabled: status,
        },
      });

      return { guild };
    },
  });
