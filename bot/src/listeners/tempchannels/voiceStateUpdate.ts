import { ApplyOptions } from '@sapphire/decorators';
import { Listener, ListenerOptions } from '@sapphire/framework';
import type { VoiceState } from 'discord.js';
import prisma from '../../lib/prisma';

@ApplyOptions<ListenerOptions>({
  name: 'voiceStateUpdate'
})
export class VoiceStateUpdateListener extends Listener {
  public override async run(
    oldState: VoiceState,
    newState: VoiceState
  ): Promise<void> {
    const guildDB = await prisma.guild.findUnique({
      where: {
        id: newState.guild.id
      },
      select: {
        hub: true,
        hubChannel: true,
        tempChannels: true
      }
    });

    // now user is in hub channel, create him a new voice channel and move him there
    if (newState.channelId) {
      if (!newState.member) return; // should not happen but just in case

      if (newState.channelId === guildDB?.hubChannel && guildDB.hub) {
        const tempChannel = await prisma.tempChannel.findFirst({
          where: {
            ownerId: newState.member.id
          }
        });
        // user entered hub channel but he already has a temp channel, so move him there
        if (tempChannel) {
          await newState.setChannel(tempChannel.id);
          return;
        }

        const guild = newState.guild;
        const channels = guild.channels;

        const channel = await channels.create(
          `${newState.member.user.username}'s channel`,
          {
            type: 'GUILD_VOICE',
            parent: guildDB?.hub,
            permissionOverwrites: [
              {
                id: newState.member.id,
                allow: [
                  'MOVE_MEMBERS',
                  'MUTE_MEMBERS',
                  'DEAFEN_MEMBERS',
                  'MANAGE_CHANNELS',
                  'STREAM'
                ]
              }
            ]
          }
        );

        await prisma.tempChannel.create({
          data: {
            id: channel.id,
            ownerId: newState.member.id,
            guildId: newState.guild.id
          }
        });

        await newState.member.voice.setChannel(channel);
      }
    } else if (!newState.channelId) {
      // user left hub channel, delete his temp channel

      const tempChannel = await prisma.tempChannel.findFirst({
        where: {
          ownerId: oldState.member?.id
        }
      });

      if (tempChannel) {
        Promise.all([
          oldState.channel?.delete(),
          prisma.tempChannel.delete({
            where: {
              id: tempChannel.id
            }
          })
        ]);
      }
    }
  }
}
