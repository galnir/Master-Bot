import { t } from '../trpc';
import { z } from 'zod';
import { TRPCError } from '@trpc/server';
import { getFetch } from '@trpc/client';

const fetch = getFetch();

export const hubRouter = t.router({
  create: t.procedure
    .input(
      z.object({
        guildId: z.string(),
        name: z.string()
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { guildId, name } = input;
      const token = process.env.DISCORD_TOKEN;

      let parent;
      try {
        const response = await fetch(
          `https://discordapp.com/api/guilds/${guildId}/channels`,
          {
            headers: {
              Authorization: `Bot ${token}`,
              'Content-Type': 'application/json'
            },
            method: 'POST',
            body: JSON.stringify({
              name,
              type: 4
            })
          }
        );
        parent = await response.json();
      } catch (e) {
        console.log(e);
        throw new TRPCError({
          message: 'Could not create channel',
          code: 'INTERNAL_SERVER_ERROR'
        });
      }

      let hubChannel;
      try {
        const response = await fetch(
          `https://discordapp.com/api/guilds/${guildId}/channels`,
          {
            headers: {
              Authorization: `Bot ${token}`,
              'Content-Type': 'application/json'
            },
            method: 'POST',
            body: JSON.stringify({
              name: 'Join To Create',
              type: 2,
              parent_id: parent.id
            })
          }
        );
        hubChannel = await response.json();
      } catch {
        throw new TRPCError({
          message: 'Could not create channel',
          code: 'INTERNAL_SERVER_ERROR'
        });
      }

      const updatedGuild = await ctx.prisma.guild.update({
        where: {
          id: guildId
        },
        data: {
          hub: parent.id,
          hubChannel: hubChannel.id
        }
      });

      return {
        guild: updatedGuild
      };
    }),
  delete: t.procedure
    .input(
      z.object({
        guildId: z.string()
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { guildId } = input;

      const token = process.env.DISCORD_TOKEN;

      const guild = await ctx.prisma.guild.findUnique({
        where: {
          id: guildId
        },
        select: {
          hub: true,
          hubChannel: true
        }
      });

      if (!guild) {
        throw new TRPCError({
          message: 'Guild not found',
          code: 'NOT_FOUND'
        });
      }

      try {
        Promise.all([
          fetch(`https://discordapp.com/api/channels/${guild.hubChannel}`, {
            headers: {
              Authorization: `Bot ${token}`
            },
            method: 'DELETE'
          }),
          fetch(`https://discordapp.com/api/channels/${guild.hub}`, {
            headers: {
              Authorization: `Bot ${token}`
            },
            method: 'DELETE'
          })
        ]).then(async () => {
          await ctx.prisma.guild.update({
            where: {
              id: guildId
            },
            data: {
              hub: null,
              hubChannel: null
            }
          });
        });
      } catch (e) {
        console.log(e);
        throw new TRPCError({
          message: 'Could not delete channel',
          code: 'INTERNAL_SERVER_ERROR'
        });
      }
    }),
  getTempChannel: t.procedure
    .input(
      z.object({
        guildId: z.string(),
        ownerId: z.string()
      })
    )
    .query(async ({ ctx, input }) => {
      const { guildId, ownerId } = input;

      const tempChannel = await ctx.prisma.tempChannel.findFirst({
        where: {
          guildId,
          ownerId
        }
      });

      return { tempChannel };
    }),
  createTempChannel: t.procedure
    .input(
      z.object({
        guildId: z.string(),
        ownerId: z.string(),
        channelId: z.string()
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { guildId, ownerId, channelId } = input;

      const tempChannel = await ctx.prisma.tempChannel.create({
        data: {
          guildId,
          ownerId,
          id: channelId
        }
      });

      return { tempChannel };
    }),
  deleteTempChannel: t.procedure
    .input(
      z.object({
        channelId: z.string()
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { channelId } = input;

      const tempChannel = await ctx.prisma.tempChannel.delete({
        where: {
          id: channelId
        }
      });

      return { tempChannel };
    })
});
