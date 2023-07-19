import { z } from "zod";

import { createTRPCRouter, publicProcedure } from "../trpc";

export const twitchRouter = createTRPCRouter({
  getAll: publicProcedure.query(async ({ ctx }) => {
    const notifications = await ctx.prisma.twitchNotify.findMany();

    return { notifications };
  }),
  findUserById: publicProcedure
    .input(
      z.object({
        id: z.string(),
      }),
    )
    .query(async ({ ctx, input }) => {
      const { id } = input;

      const notification = await ctx.prisma.twitchNotify.findFirst({
        where: {
          twitchId: id,
        },
      });

      return { notification };
    }),
  create: publicProcedure
    .input(
      z.object({
        userId: z.string(),
        userImage: z.string(),
        channelId: z.string(),
        sendTo: z.array(z.string()),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const { userId, userImage, channelId, sendTo } = input;
      await ctx.prisma.twitchNotify.upsert({
        create: {
          twitchId: userId,
          channelIds: [channelId],
          logo: userImage,
          sent: false,
        },
        update: { channelIds: sendTo },
        where: { twitchId: userId },
      });
    }),
  updateNotification: publicProcedure
    .input(
      z.object({
        userId: z.string(),
        channelIds: z.array(z.string()),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const { userId, channelIds } = input;

      const notification = await ctx.prisma.twitchNotify.update({
        where: {
          twitchId: userId,
        },
        data: {
          channelIds,
        },
      });

      return { notification };
    }),
  delete: publicProcedure
    .input(
      z.object({
        userId: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const { userId } = input;

      const notification = await ctx.prisma.twitchNotify.delete({
        where: {
          twitchId: userId,
        },
      });

      return { notification };
    }),
  updateNotificationStatus: publicProcedure
    .input(
      z.object({
        userId: z.string(),
        live: z.boolean(),
        sent: z.boolean(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const { live, sent, userId } = input;

      const notification = await ctx.prisma.twitchNotify.update({
        where: { twitchId: userId },
        data: { live, sent },
      });

      return { notification };
    }),
});
