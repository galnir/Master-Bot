// @ts-nocheck

import { createRouter } from "../createRouter";
import { z } from "zod";
import { APIGuild } from "discord-api-types/v10";
import { TRPCError } from "@trpc/server";

export const guildRouter = createRouter()
  .query("get-guild", {
    input: z.object({
      id: z.string(),
    }),
    async resolve({ ctx, input }) {
      const { id } = input;

      const guild = await ctx.prisma.guild.findFirst({
        where: {
          id: id as string,
        },
      });

      return { guild };
    },
  })
  // create
  .mutation("create", {
    input: z.object({
      id: z.string(),
      ownerId: z.string(),
      name: z.string(),
    }),
    async resolve({ ctx, input }) {
      const { id, ownerId, name } = input;

      const guild = await ctx.prisma.guild.upsert({
        where: {
          id: id,
        },
        update: {},
        create: {
          id: id,
          ownerId: ownerId,
          volume: 100,
          name: name,
        },
      });

      return { guild };
    },
  })
  .mutation("create-via-twitch-notification", {
    input: z.object({
      guildId: z.string(),
      userId: z.string(),
      ownerId: z.string(),
      name: z.string(),
      notifyList: z.array(z.string()),
    }),
    async resolve({ ctx, input }) {
      const { guildId, userId, ownerId, name, notifyList } = input;
      await ctx.prisma.guild.upsert({
        create: {
          id: guildId,
          notifyList: [userId],
          volume: 100,
          ownerId: ownerId,
          name: name,
        },
        select: { notifyList: true },
        update: {
          notifyList,
        },
        where: { id: guildId },
      });
    },
  })
  // delete
  .mutation("delete", {
    input: z.object({
      id: z.string(),
    }),
    async resolve({ input, ctx }) {
      const { id } = input;

      const guild = await ctx.prisma.guild.delete({
        where: {
          id: id,
        },
      });

      return { guild };
    },
  })
  .mutation("update-welcome-message", {
    input: z.object({
      guildId: z.string(),
      welcomeMessage: z.string().nullable(),
      welcomeMessageEnabled: z.boolean().nullable(),
    }),
    async resolve({ ctx, input }) {
      const { guildId, welcomeMessage, welcomeMessageEnabled } = input;

      const guild = await ctx.prisma.guild.update({
        where: {
          id: guildId,
        },
        data: {
          // undefined means do nothing, null will set the value to null
          welcomeMessage: welcomeMessage ? welcomeMessage : undefined,
          welcomeMessageEnabled: welcomeMessageEnabled
            ? welcomeMessageEnabled
            : undefined,
        },
      });

      return { guild };
    },
  })
  .query("get-all-from-local", {
    input: z.object({
      ownerId: z.string(),
    }),
    async resolve({ ctx, input }) {
      const { ownerId } = input;

      const guilds = await ctx.prisma.guild.findMany({
        where: {
          ownerId: ownerId as string,
        },
      });

      return { guilds };
    },
  })
  .query("get-all", {
    async resolve({ ctx }) {
      const account = await ctx.prisma.account.findFirst({
        where: {
          userId: ctx.session?.user?.id,
        },
        select: {
          access_token: true,
          providerAccountId: true,
        },
      });

      if (!account || !account.access_token) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Account not found",
        });
      }

      const dbGuilds = await ctx.prisma.guild.findMany({
        where: {
          ownerId: account.providerAccountId,
        },
      });

      // fetch guilds the user is owner in from discord api using the ownerId and token
      try {
        const response = await fetch(
          `https://discord.com/api/users/@me/guilds`,
          {
            headers: {
              Authorization: `Bearer ${account.access_token}`,
            },
          }
        );

        const userGuilds: APIGuild[] = await response.json();
        const guildsUserOwns = userGuilds.filter((guild) => guild.owner);
        return { apiGuilds: guildsUserOwns, dbGuilds };
      } catch {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Something went wrong when trying to fetch guilds",
        });
      }
    },
  })
  .mutation("update-twitch-notifications", {
    input: z.object({
      guildId: z.string(),
      notifyList: z.array(z.string()),
    }),
    async resolve({ ctx, input }) {
      const { guildId, notifyList } = input;

      await ctx.prisma.guild.update({
        where: { id: guildId },
        data: { notifyList },
      });
    },
  })
  .mutation("update-volume", {
    input: z.object({
      guildId: z.string(),
      volume: z.number(),
    }),
    async resolve({ ctx, input }) {
      const { guildId, volume } = input;

      await ctx.prisma.guild.update({
        where: { id: guildId },
        data: { volume },
      });
    },
  });
