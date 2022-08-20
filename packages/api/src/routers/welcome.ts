import { createRouter } from "../createRouter";
import { z } from "zod";

export const welcomeRouter = createRouter().mutation("set-message", {
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
});
