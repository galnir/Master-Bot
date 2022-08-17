/**
 *
 * This is an example router, you can delete this file and then update `../pages/api/trpc/[trpc].tsx`
 */

import { createRouter } from "../createRouter";
import { z } from "zod";

export const userRouter = createRouter()
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
