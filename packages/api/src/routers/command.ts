import { getFetch } from "@trpc/client";
import { TRPCError } from "@trpc/server";
import type {
  APIApplicationCommandPermission,
  APIGuildChannel,
  APIRole,
  ChannelType,
} from "discord-api-types/v10";
import { z } from "zod";

import { env } from "../env.mjs";
import { createTRPCRouter, publicProcedure } from "../trpc";

const fetch = getFetch();

export interface CommandType {
  code: number;
  id: string;
  applicationId: string;
  version: string;
  default_permission: string;
  default_member_permissions: null | string[];
  type: number;
  name: string;
  description: string;
  dm_permission: boolean;
  options: any[];
}

export interface CommandPermissionsResponseOkay {
  id: string;
  application_id: string;
  guild_id: string;
  permissions: APIApplicationCommandPermission[];
}

export interface CommandPermissionsResponseNotOkay {
  message: string;
  code: number;
}

export const commandRouter = createTRPCRouter({
  getDisabledCommands: publicProcedure
    .input(
      z.object({
        guildId: z.string(),
      }),
    )
    .query(async ({ ctx, input }) => {
      const { guildId } = input;

      const guild = await ctx.prisma.guild.findUnique({
        where: {
          id: guildId,
        },
        select: {
          disabledCommands: true,
        },
      });

      if (!guild) {
        throw new TRPCError({
          message: "Guild not found",
          code: "NOT_FOUND",
        });
      }

      return { disabledCommands: guild.disabledCommands };
    }),
  getCommands: publicProcedure
    .input(
      z.object({
        guildId: z.string(),
      }),
    )
    .query(async () => {
      try {
        const token = env.DISCORD_TOKEN;
        const response = await fetch(
          `https://discordapp.com/api/applications/${env.DISCORD_CLIENT_ID}/commands`,
          {
            headers: {
              Authorization: `Bot ${token}`,
            },
          },
        );
        const commands = (await response.json()) as CommandType[];

        return { commands };
      } catch (e) {
        console.error(e);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Something went wrong when trying to fetch guilds",
        });
      }
    }),
  getCommandAndGuildChannels: publicProcedure
    .input(
      z.object({
        guildId: z.string(),
        commandId: z.string(),
      }),
    )
    .query(async ({ ctx, input }) => {
      if (!ctx.session) {
        throw new TRPCError({
          message: "Not Authenticated",
          code: "UNAUTHORIZED",
        });
      }

      const token = env.DISCORD_TOKEN;
      const clientID = env.DISCORD_CLIENT_ID;
      const { guildId, commandId } = input;

      const account = await ctx.prisma.account.findFirst({
        where: {
          userId: ctx.session?.user?.id,
        },
        select: {
          access_token: true,
          providerAccountId: true,
          user: {
            select: {
              discordId: true,
            },
          },
        },
      });

      try {
        const [
          guildChannelsResponse,
          guildRolesResponse,
          commandResponse,
          permissionsResponse,
        ] = await Promise.all([
          fetch(`https://discord.com/api/guilds/${guildId}/channels`, {
            headers: {
              Authorization: `Bot ${token}`,
            },
          }).then((res: any) => res.json()) as Promise<unknown>,
          fetch(`https://discord.com/api/guilds/${guildId}/roles`, {
            headers: {
              Authorization: `Bot ${token}`,
            },
          }).then((res: any) => res.json()) as Promise<unknown>,
          fetch(
            `https://discord.com/api/applications/${clientID}/commands/${commandId}`,
            {
              headers: {
                Authorization: `Bot ${token}`,
              },
            },
          ).then((res: any) => res.json()) as Promise<unknown>,
          fetch(
            `https://discord.com/api/applications/${clientID}/guilds/${guildId}/commands/${commandId}/permissions`,
            {
              headers: {
                Authorization: `Bearer ${account?.access_token}`,
              },
            },
          ).then((res: any) => res.json()),
        ]);

        const channels =
          guildChannelsResponse as APIGuildChannel<ChannelType>[];
        const roles = guildRolesResponse as APIRole[];
        const command = commandResponse as CommandType;
        const permissions = permissionsResponse;

        return { channels, roles, command, permissions };
      } catch {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Something went wrong when trying to fetch guilds",
        });
      }
    }),
  getCommandPermissions: publicProcedure
    .input(
      z.object({
        guildId: z.string(),
        commandId: z.string(),
      }),
    )
    .query(async ({ ctx, input }) => {
      const clientID = env.DISCORD_CLIENT_ID;
      const { guildId, commandId } = input;

      if (!ctx.session) {
        throw new TRPCError({
          message: "Not Authenticated",
          code: "UNAUTHORIZED",
        });
      }

      const account = await ctx.prisma.account.findFirst({
        where: {
          userId: ctx.session?.user?.id,
        },
        select: {
          access_token: true,
          providerAccountId: true,
          user: {
            select: {
              discordId: true,
            },
          },
        },
      });
      try {
        const response = await fetch(
          `https://discord.com/api/applications/${clientID}/guilds/${guildId}/commands/${commandId}/permissions`,
          {
            headers: {
              Authorization: `Bearer ${account?.access_token}`,
            },
          },
        );
        const command = await response.json();
        if (!command) throw new Error();

        return { command };
      } catch {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Something went wrong when trying to fetch guilds",
        });
      }
    }),
  editCommandPermissions: publicProcedure
    .input(
      z.object({
        guildId: z.string(),
        commandId: z.string(),
        permissions: z.array(
          z.object({
            id: z.string(),
            type: z.number(),
            permission: z.boolean(),
          }),
        ),
        type: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const clientID = env.DISCORD_CLIENT_ID;
      const { guildId, commandId, permissions, type } = input;
      if (!ctx.session) {
        throw new TRPCError({
          message: "Not Authenticated",
          code: "UNAUTHORIZED",
        });
      }

      const account = await ctx.prisma.account.findFirst({
        where: {
          userId: ctx.session?.user?.id,
        },
        select: {
          access_token: true,
          providerAccountId: true,
          user: {
            select: {
              discordId: true,
            },
          },
        },
      });

      const everyone = {
        id: guildId,
        type: 1,
        permission: type === "allow" ? true : false,
      };

      try {
        const response = await fetch(
          `https://discord.com/api/applications/${clientID}/guilds/${guildId}/commands/${commandId}/permissions`,
          {
            method: "PUT",
            headers: {
              Authorization: `Bearer ${account?.access_token}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ permissions: [everyone, ...permissions] }),
          },
        );
        const command = await response.json();
        if (!command) throw new Error();

        return { command };
      } catch {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Something went wrong when trying to fetch guilds",
        });
      }
    }),

  toggleCommand: publicProcedure
    .input(
      z.object({
        guildId: z.string(),
        commandId: z.string(),
        status: z.boolean(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const { guildId, commandId, status } = input;

      const guild = await ctx.prisma.guild.findUnique({
        where: {
          id: guildId,
        },
        select: {
          disabledCommands: true,
        },
      });

      if (!guild) {
        throw new TRPCError({
          message: "Guild not found",
          code: "NOT_FOUND",
        });
      }

      let updatedGuild;

      if (status) {
        updatedGuild = await ctx.prisma.guild.update({
          where: {
            id: guildId,
          },
          data: {
            disabledCommands: {
              set: [...guild?.disabledCommands, commandId],
            },
          },
        });
      } else {
        updatedGuild = await ctx.prisma.guild.update({
          where: {
            id: guildId,
          },
          data: {
            disabledCommands: {
              set: guild?.disabledCommands.filter((cid) => cid !== commandId),
            },
          },
        });
      }

      return { updatedGuild };
    }),
});
