import { createRouter } from "../createRouter";
import { z } from "zod";

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
  .mutation("create", {
    input: z.object({
      id: z.string(),
      name: z.string(),
    }),
    async resolve({ ctx, input }) {
      const { id, name } = input;
      const user = await ctx.prisma.user.create({
        data: {
          discordId: id,
          name,
        },
      });
      return { user };
    },
  })
  // delete
  .mutation("delete", {
    input: z.object({
      id: z.string(),
    }),
    async resolve({ input, ctx }) {
      const { id } = input;

      const user = await ctx.prisma.user.delete({
        where: {
          discordId: id,
        },
      });

      return { user };
    },
  });
