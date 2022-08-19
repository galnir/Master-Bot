import { createRouter } from "../createRouter";
import { z } from "zod";

export const twitchRouter = createRouter()
  .query("get-all", {
    async resolve({ ctx }) {
      const notifications = await ctx.prisma.twitchNotify.findMany();

      return { notifications };
    },
  })
  .query("find-by-user-id", {
    input: z.object({
      id: z.string(),
    }),
    async resolve({ ctx, input }) {
      const { id } = input;

      const notification = await ctx.prisma.twitchNotify.findFirst({
        where: {
          twitchId: id,
        },
      });

      return { notification };
    },
  })
  .mutation("create", {
    input: z.object({
      userId: z.string(),
      userImage: z.string(),
      channelId: z.string(),
      sendTo: z.array(z.string()),
    }),
    async resolve({ ctx, input }) {
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
    },
  })
  .mutation("update-notification", {
    input: z.object({
      userId: z.string(),
      channelIds: z.array(z.string()),
    }),
    async resolve({ input, ctx }) {
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
    },
  })
  .mutation("delete", {
    input: z.object({
      userId: z.string(),
    }),
    async resolve({ ctx, input }) {
      const { userId } = input;

      const notification = await ctx.prisma.twitchNotify.delete({
        where: {
          twitchId: userId,
        },
      });

      return { notification };
    },
  })
  .mutation("update-notification-status", {
    input: z.object({
      userId: z.string(),
      live: z.boolean(),
      sent: z.boolean(),
    }),
    async resolve({ ctx, input }) {
      const { live, sent, userId } = input;

      const notification = await ctx.prisma.twitchNotify.update({
        where: { twitchId: userId },
        data: { live, sent },
      });

      return { notification };
    },
  });
