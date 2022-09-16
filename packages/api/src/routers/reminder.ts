import { createRouter } from "../createRouter";
import { z } from "zod";

export const reminderRouter = createRouter()
  .query("get-reminder", {
    input: z.object({
      userId: z.string(),
      event: z.string(),
    }),
    async resolve({ ctx, input }) {
      const { userId, event } = input;

      const reminder = await ctx.prisma.reminder.findFirst({
        where: {
          userId,
          event,
        },
        include: { user: true },
      });

      return { reminder };
    },
  })
  .query("get-all", {
    async resolve({ ctx }) {
      const reminders = await ctx.prisma.reminder.findMany({
        select: {
          dateTime: true,
          userId: true,
          event: true,
          description: true,
          repeat: true,
          user: true,
        },
        orderBy: {
          id: "asc",
        },
      });

      return { reminders };
    },
  })
  .query("get-by-user-id", {
    input: z.object({
      userId: z.string(),
    }),
    async resolve({ ctx, input }) {
      const { userId } = input;

      const reminders = await ctx.prisma.reminder.findMany({
        where: {
          userId,
        },
        select: {
          event: true,
          dateTime: true,
          description: true,
        },
        orderBy: {
          id: "asc",
        },
      });

      return { reminders };
    },
  })
  // create
  .mutation("create", {
    input: z.object({
      userId: z.string(),
      event: z.string(),
      description: z.nullable(z.string()),
      dateTime: z.string(),
      repeat: z.nullable(z.string()),
    }),
    async resolve({ ctx, input }) {
      const { userId, event, description, dateTime, repeat } = input;

      const reminder = await ctx.prisma.reminder.create({
        data: {
          event,
          description,
          dateTime,
          repeat,
          user: { connect: { discordId: userId } },
        },
      });

      return { reminder };
    },
  })
  // delete
  .mutation("delete", {
    input: z.object({
      userId: z.string(),
      event: z.string(),
    }),
    async resolve({ input, ctx }) {
      const { userId, event } = input;

      const reminder = await ctx.prisma.reminder.deleteMany({
        where: {
          userId,
          event,
        },
      });

      return { reminder };
    },
  });
