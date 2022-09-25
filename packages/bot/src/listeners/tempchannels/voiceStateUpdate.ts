import { ApplyOptions } from '@sapphire/decorators';
import { Listener, ListenerOptions } from '@sapphire/framework';
import type { VoiceChannel, VoiceState } from 'discord.js';
import { trpcNode } from '../../trpc';

@ApplyOptions<ListenerOptions>({
  name: 'voiceStateUpdate'
})
export class VoiceStateUpdateListener extends Listener {
  public override async run(
    oldState: VoiceState,
    newState: VoiceState
  ): Promise<void> {
    const { guild: guildDB } = await trpcNode.guild.getGuild.query({
      id: newState.guild.id
    });

    // now user is in hub channel, create him a new voice channel and move him there
    if (newState.channelId) {
      if (!newState.member) return; // should not happen but just in case

      if (newState.channelId === guildDB?.hubChannel && guildDB.hub) {
        const { tempChannel } = await trpcNode.hub.getTempChannel.query({
          guildId: newState.guild.id,
          ownerId: newState.member.id
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

        await trpcNode.hub.createTempChannel.mutate({
          guildId: newState.guild.id,
          ownerId: newState.member.id,
          channelId: channel.id
        });

        await newState.member.voice.setChannel(channel);
      } else {
        const { tempChannel } = await trpcNode.hub.getTempChannel.query({
          guildId: newState.guild.id,
          ownerId: newState.member.id
        });
        if (!tempChannel) return;

        if (tempChannel.id === newState.channelId) return;

        const channel = (await newState.guild.channels.fetch(
          tempChannel.id
        )) as VoiceChannel;
        if (!channel) return;

        Promise.all([
          channel.delete(),
          trpcNode.hub.deleteTempChannel.mutate({
            channelId: tempChannel.id
          })
        ]);
      }
    } else if (!newState.channelId) {
      // user left hub channel, delete his temp channel
      deleteChannel(oldState);
    }
  }
}

async function deleteChannel(state: VoiceState) {
  const { tempChannel } = await trpcNode.hub.getTempChannel.query({
    guildId: state.guild.id,
    ownerId: state.member!.id
  });

  if (tempChannel) {
    Promise.all([
      state.channel?.delete(),
      trpcNode.hub.deleteTempChannel.mutate({
        channelId: tempChannel.id
      })
    ]);
  }
}
