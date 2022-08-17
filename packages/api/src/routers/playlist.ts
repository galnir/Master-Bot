import { createRouter } from "../createRouter";
import { z } from "zod";

export const playlistRouter = createRouter()
  .query("get-playlist", {
    input: z.object({
      userId: z.string(),
      name: z.string(),
    }),
    async resolve({ ctx, input }) {
      const { userId, name } = input;

      const playlist = await ctx.prisma.playlist.findFirst({
        where: {
          userId,
          name,
        },
      });

      return { playlist };
    },
  })
  // create
  .mutation("create", {
    input: z.object({
      userId: z.string(),
      name: z.string(),
    }),
    async resolve({ ctx, input }) {
      const { userId, name } = input;

      const playlist = await ctx.prisma.playlist.create({
        data: {
          name,
          user: {
            connect: {
              id: userId,
            },
          },
        },
      });

      return { playlist };
    },
  })
  // delete
  .mutation("delete", {
    input: z.object({
      userId: z.string(),
      name: z.string(),
    }),
    async resolve({ input, ctx }) {
      const { userId, name } = input;

      const playlist = await ctx.prisma.playlist.deleteMany({
        where: {
          userId,
          name,
        },
      });

      return { playlist };
    },
  });
