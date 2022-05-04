import { TwitchEmbed } from './TwitchEmbed';
import { container } from '@sapphire/framework';
import type { MessageChannel } from './../../../index';
import prisma from '../../prisma';

//
export async function notify(query: string[]) {
  const { client } = container;
  const token = client.twitch.auth.access_token;
  if (!token) return;
  if (query.length > 0) {
    const streamMap = new Map();
    await client.twitch.api
      .getStreamingUsers({
        user_ids: query,
        token: token
      })
      .then(async response => {
        response.reduce((obj, user) => streamMap.set(user.user_id, user), {});

        for (const entry of query) {
          client.twitch.notifyList[entry] = {
            live: streamMap.get(entry) ? true : false,
            messageSent: client.twitch.notifyList[entry].messageSent,
            logo: client.twitch.notifyList[entry].logo,
            sendTo: client.twitch.notifyList[entry].sendTo
          };

          if (
            client.twitch.notifyList[entry].live &&
            !client.twitch.notifyList[entry].messageSent
          ) {
            const game = await client.twitch.api.getGame({
              token: client.twitch.auth.access_token,
              id: streamMap.get(entry).game_id
            });
            for (const channelToMsg of client.twitch.notifyList[entry].sendTo) {
              const channel = client.channels.cache.get(
                channelToMsg
              ) as MessageChannel;

              if (channel) {
                const twitchMsg = new TwitchEmbed(
                  streamMap.get(entry),
                  client.twitch.notifyList[entry].logo,
                  game.box_art_url
                );
                await channel.send({
                  embeds: [await twitchMsg.TwitchEmbed()]
                });
              }
            }

            client.twitch.notifyList[entry].messageSent = true;
            await prisma.twitchNotify.update({
              where: { twitchId: entry },
              select: { live: true, sent: true },
              data: { live: true, sent: true }
            });

            if (
              client.twitch.notifyList[entry].live == false &&
              client.twitch.notifyList[entry].messageSent
            ) {
              client.twitch.notifyList[entry].messageSent = false;
              await prisma.twitchNotify.update({
                where: { twitchId: entry },
                select: { live: true, sent: true },
                data: { live: false, sent: false }
              });
            }
          }
        }
      });
  }
}
