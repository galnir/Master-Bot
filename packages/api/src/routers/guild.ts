import { t } from '../trpc';
import { z } from 'zod';
import { APIGuild, APIRole } from 'discord-api-types/v10';
import { TRPCError } from '@trpc/server';
import { getFetch } from '@trpc/client';

const fetch = getFetch();

export const guildRouter = t.router({
  getGuild: t.procedure
    .input(
      z.object({
        id: z.string()
      })
    )
    .query(async ({ ctx, input }) => {
      const { id } = input;

      const guild = await ctx.prisma.guild.findUnique({
        where: {
          id
        }
      });

      return { guild };
    }),
  getGuildFromAPI: t.procedure
    .input(
      z.object({
        guildId: z.string()
      })
    )
    .query(async ({ ctx, input }) => {
      const token = process.env.DISCORD_BOT_TOKEN;
      const { guildId } = input;
      if (!ctx.session) {
        throw new TRPCError({
          message: 'Not Authenticated',
          code: 'UNAUTHORIZED'
        });
      }

      try {
        const response = await fetch(
          `https://discord.com/api/guilds/${guildId}`,
          {
            headers: {
              Authorization: `Bot ${token}`
            }
          }
        );

        const guild: APIGuild = await response.json();

        return { guild };
      } catch {
        throw new TRPCError({
          message: 'Not Found',
          code: 'NOT_FOUND'
        });
      }
    }),
  getGuildAndUser: t.procedure
    .input(
      z.object({
        id: z.string()
      })
    )
    .query(async ({ ctx, input }) => {
      const { id } = input;

      const guild = await ctx.prisma.guild.findUnique({
        where: {
          id
        }
      });

      const user = await ctx.prisma.user.findUnique({
        where: {
          // @ts-ignore
          id: ctx.session?.user?.id
        }
      });

      if (guild?.ownerId !== user?.discordId) {
        throw new TRPCError({
          message: 'UNAUTHORIZED',
          code: 'UNAUTHORIZED'
        });
      }

      return { guild, user };
    }),
  create: t.procedure
    .input(
      z.object({
        id: z.string(),
        ownerId: z.string(),
        name: z.string()
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { id, ownerId, name } = input;

      const guild = await ctx.prisma.guild.upsert({
        where: {
          id: id
        },
        update: {},
        create: {
          id: id,
          ownerId: ownerId,
          volume: 100,
          name: name
        }
      });

      return { guild };
    }),
  createViaTwitchNotification: t.procedure
    .input(
      z.object({
        guildId: z.string(),
        userId: z.string(),
        ownerId: z.string(),
        name: z.string(),
        notifyList: z.array(z.string())
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { guildId, userId, ownerId, name, notifyList } = input;
      await ctx.prisma.guild.upsert({
        create: {
          id: guildId,
          notifyList: [userId],
          volume: 100,
          ownerId: ownerId,
          name: name
        },
        select: { notifyList: true },
        update: {
          notifyList
        },
        where: { id: guildId }
      });
    }),
  delete: t.procedure
    .input(
      z.object({
        id: z.string()
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { id } = input;

      const guild = await ctx.prisma.guild.delete({
        where: {
          id: id
        }
      });

      return { guild };
    }),
  updateWelcomeMessage: t.procedure
    .input(
      z.object({
        guildId: z.string(),
        welcomeMessage: z.string().nullable(),
        welcomeMessageEnabled: z.boolean().nullable()
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { guildId, welcomeMessage, welcomeMessageEnabled } = input;

      const guild = await ctx.prisma.guild.update({
        where: {
          id: guildId
        },
        data: {
          // undefined means do nothing, null will set the value to null
          welcomeMessage: welcomeMessage ? welcomeMessage : undefined,
          welcomeMessageEnabled: welcomeMessageEnabled
            ? welcomeMessageEnabled
            : undefined
        }
      });

      return { guild };
    }),
  toggleWelcomeMessage: t.procedure
    .input(
      z.object({
        status: z.boolean(),
        guildId: z.string()
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { status, guildId } = input;

      const guild = await ctx.prisma.guild.update({
        where: {
          id: guildId
        },
        data: {
          welcomeMessageEnabled: status
        }
      });

      return { guild };
    }),
  updateWelcomeMessageChannel: t.procedure
    .input(
      z.object({
        guildId: z.string(),
        channelId: z.string()
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { guildId, channelId } = input;

      const guild = await ctx.prisma.guild.update({
        where: {
          id: guildId
        },
        data: {
          welcomeMessageChannel: channelId
        }
      });

      return { guild };
    }),
  getAllFromLocal: t.procedure
    .input(
      z.object({
        ownerId: z.string()
      })
    )
    .query(async ({ ctx, input }) => {
      const { ownerId } = input;

      const guilds = await ctx.prisma.guild.findMany({
        where: {
          ownerId: ownerId as string
        }
      });

      return { guilds };
    }),
  getAll: t.procedure.query(async ({ ctx }) => {
    if (!ctx.session) {
      throw new TRPCError({
        message: 'Not Authenticated',
        code: 'UNAUTHORIZED'
      });
    }

    const account = await ctx.prisma.account.findFirst({
      where: {
        // @ts-ignore
        userId: ctx.session?.user?.id
      },
      select: {
        access_token: true,
        providerAccountId: true
      }
    });

    if (!account || !account.access_token) {
      throw new TRPCError({
        code: 'NOT_FOUND',
        message: 'Account not found'
      });
    }

    const dbGuilds = await ctx.prisma.guild.findMany({
      where: {
        ownerId: account.providerAccountId
      }
    });

    // fetch guilds the user is owner in from discord api using the ownerId and token
    try {
      const response = await fetch(`https://discord.com/api/users/@me/guilds`, {
        headers: {
          Authorization: `Bearer ${account.access_token}`
        }
      });

      const userGuilds: APIGuild[] = await response.json();
      if (!userGuilds.length) {
        return { guilds: dbGuilds };
      }
      const guildsUserOwns = userGuilds.filter(guild => guild.owner);
      return { apiGuilds: guildsUserOwns, dbGuilds };
    } catch (e) {
      console.error(e);
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Something went wrong when trying to fetch guilds'
      });
    }
  }),
  getAllFromDiscordAPI: t.procedure.query(async ({ ctx }) => {
    if (!ctx.session) {
      throw new TRPCError({
        message: 'Not Authenticated',
        code: 'UNAUTHORIZED'
      });
    }

    const account = await ctx.prisma.account.findFirst({
      where: {
        // @ts-ignore
        userId: ctx.session?.user?.id
      },
      select: {
        access_token: true,
        providerAccountId: true,
        user: {
          select: {
            discordId: true
          }
        }
      }
    });

    if (!account || !account.access_token) {
      throw new TRPCError({
        code: 'NOT_FOUND',
        message: 'Account not found'
      });
    }

    const response = await fetch(`https://discord.com/api/users/@me/guilds`, {
      headers: {
        Authorization: `Bearer ${account.access_token}`
      }
    });

    const userGuilds: APIGuild[] = await response.json();

    return { guilds: userGuilds, discordId: account.user.discordId };
  }),
  updateTwitchNotifications: t.procedure
    .input(
      z.object({
        guildId: z.string(),
        notifyList: z.array(z.string())
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { guildId, notifyList } = input;

      await ctx.prisma.guild.update({
        where: { id: guildId },
        data: { notifyList }
      });
    }),
  updateVolume: t.procedure
    .input(
      z.object({
        guildId: z.string(),
        volume: z.number()
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { guildId, volume } = input;

      await ctx.prisma.guild.update({
        where: { id: guildId },
        data: { volume }
      });
    }),
  getRoles: t.procedure
    .input(
      z.object({
        guildId: z.string()
      })
    )
    .query(async ({ ctx, input }) => {
      const { guildId } = input;
      const token = process.env.DISCORD_TOKEN;

      if (!ctx.session) {
        throw new TRPCError({
          message: 'Not Authenticated',
          code: 'UNAUTHORIZED'
        });
      }

      const response = await fetch(
        `https://discord.com/api/guilds/${guildId}/roles`,
        {
          headers: {
            Authorization: `Bot ${token}`
          }
        }
      );

      const roles: APIRole[] = await response.json();

      return { roles };
    })
});
