import { createRouter } from "../createRouter";
import { z } from "zod";

export const songRouter = createRouter()
  .mutation("create-many", {
    input: z.object({
      songs: z.array(z.any()),
    }),
    async resolve({ ctx, input }) {
      const { songs } = input;

      const songsCreated = await ctx.prisma.song.createMany({
        data: songs,
      });

      return { songsCreated };
    },
  })
  .mutation("delete", {
    input: z.object({
      id: z.number(),
    }),
    async resolve({ ctx, input }) {
      const { id } = input;

      const song = await ctx.prisma.song.delete({
        where: {
          id: id,
        },
      });

      return { song };
    },
  });
