import { createRouter } from "../createRouter";
import { z } from "zod";
import { TRPCError } from "@trpc/server";

export const userRouter = createRouter()
  .query("get-user-by-id", {
    input: z.object({
      id: z.string(),
    }),
    async resolve({ ctx, input }) {
      const { id } = input;

      const user = await ctx.prisma.user.findUnique({
        where: {
          discordId: id,
        },
      });

      return { user };
    },
  })
  // create
  .mutation("add", {
    input: z.object({
      id: z.string(),
      username: z.string(),
    }),
    async resolve({ ctx, input }) {
      const todo = await ctx.prisma.user.create({
        data: input,
      });
      return todo;
    },
  })
  // read
  .query("all", {
    async resolve({ ctx }) {
      /**
       * For pagination you can have a look at this docs site
       * @link https://trpc.io/docs/useInfiniteQuery
       */

      return ctx.prisma.user.findMany({
        select: {
          id: true,
          username: true,
        },
      });
    },
  });
