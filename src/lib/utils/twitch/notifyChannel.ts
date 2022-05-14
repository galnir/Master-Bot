import type { TwitchGame, TwitchStream } from './twitchAPI-types';
import { TwitchEmbed } from './TwitchEmbed';
import { container } from '@sapphire/framework';
import type { MessageChannel } from './../../../index';
import prisma from '../../prisma';
import type { Message } from 'discord.js';

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
      .then(async (response: TwitchStream[]) => {
        response.reduce((obj, user) => streamMap.set(user.user_id, user), {});

        for (const entry of query) {
          const stream: TwitchStream = await streamMap.get(entry);
          client.twitch.notifyList[entry] = {
            live: stream ? true : false,
            messageSent: client.twitch.notifyList[entry].messageSent,
            logo: client.twitch.notifyList[entry].logo,
            gameName: client.twitch.notifyList[entry].gameName,
            title: client.twitch.notifyList[entry].title,
            sendTo: client.twitch.notifyList[entry].sendTo,
            messageHandler: client.twitch.notifyList[entry].messageHandler,
            boxArt: client.twitch.notifyList[entry].boxArt
          };

          // Stream Started Embed Created
          if (client.twitch.notifyList[entry].live) {
            const prevGame = client.twitch.notifyList[entry].gameName;
            const prevTitle = client.twitch.notifyList[entry].title;

            client.twitch.notifyList[entry].gameName = stream.game_name;
            client.twitch.notifyList[entry].title = stream.title;

            if (!client.twitch.notifyList[entry].messageSent) {
              let game: TwitchGame = await client.twitch.api.getGame({
                token: client.twitch.auth.access_token,
                id: stream.game_id
              });

              // Run through Twitch Ids List
              for (const channelToMsg of client.twitch.notifyList[entry]
                .sendTo) {
                const channel = client.channels.cache.get(
                  channelToMsg
                ) as MessageChannel;

                if (channel) {
                  const twitchMsg = new TwitchEmbed(
                    stream,
                    client.twitch.notifyList[entry].logo,
                    game.box_art_url,
                    false, // Offline
                    false // Stream Update
                  );
                  // client.twitch.notifyList[entry].messageHandler[channel.id] = {
                  //   messageIds: []
                  // };
                  await channel
                    .send({
                      embeds: [await twitchMsg.TwitchEmbed()]
                    })
                    .then((message: Message) => {
                      if (
                        !client.twitch.notifyList[entry].messageHandler[
                          message.channel.id
                        ]
                      )
                        client.twitch.notifyList[entry].messageHandler[
                          message.channel.id
                        ] = { messageIds: [message.id] };
                      else
                        client.twitch.notifyList[entry].messageHandler[
                          message.channel.id
                        ].messageIds.push(message.id);
                    });
                }
              }

              client.twitch.notifyList[entry].messageSent = true;
              await prisma.twitchNotify.update({
                where: { twitchId: entry },
                select: { live: true, sent: true },
                data: { live: true, sent: true }
              });
            }

            // Stream Change Embed Edit
            if (prevGame && prevTitle)
              if (
                prevTitle !== stream.title ||
                (prevGame !== stream.game_name &&
                  client.twitch.notifyList[entry].messageSent == true)
              ) {
                if (prevGame !== stream.game_name) {
                  const game: TwitchGame = await client.twitch.api.getGame({
                    token: client.twitch.auth.access_token,
                    id: stream.game_id
                  });
                  client.twitch.notifyList[entry].boxArt = game.box_art_url;
                }
                const twitchMsg = new TwitchEmbed(
                  stream,
                  client.twitch.notifyList[entry].logo,
                  client.twitch.notifyList[entry].boxArt!,
                  false, // Offline
                  true // Stream Update
                );
                for (let channelId in client.twitch.notifyList[entry]
                  .messageHandler) {
                  client.channels.fetch(channelId).then(async channel => {
                    const msgChannel = channel as MessageChannel;

                    for (let messageId in client.twitch.notifyList[entry]
                      .messageHandler[channelId].messageIds) {
                      await msgChannel?.messages
                        .edit(
                          client.twitch.notifyList[entry].messageHandler[
                            channelId
                          ].messageIds[messageId],
                          {
                            embeds: [await twitchMsg.TwitchEmbed()]
                          }
                        )
                        .catch(error =>
                          console.log(
                            'Failed to Edit Stream Notification',
                            error
                          )
                        );
                    }
                  });
                }
              }
          }

          // Offline Embed Edit
          if (
            client.twitch.notifyList[entry].live == false &&
            client.twitch.notifyList[entry].messageSent == true
          ) {
            const twitchMsg = new TwitchEmbed(
              stream,
              client.twitch.notifyList[entry].logo,
              client.twitch.notifyList[entry].boxArt!,
              true, // offline
              false // Stream Update
            );
            for (let channelId in client.twitch.notifyList[entry]
              .messageHandler) {
              client.channels.fetch(channelId).then(async channel => {
                const msgChannel = channel as MessageChannel;
                for (let messageId in client.twitch.notifyList[entry]
                  .messageHandler![channelId].messageIds) {
                  await msgChannel?.messages
                    .edit(
                      client.twitch.notifyList[entry].messageHandler![channelId]
                        .messageIds[messageId],
                      {
                        embeds: [await twitchMsg.TwitchEmbed()]
                      }
                    )
                    .catch(error =>
                      console.log(
                        'Failed to Edit Offline Stream Notification',
                        error
                      )
                    );
                }
              });
            }
            client.twitch.notifyList[entry].messageHandler = {};

            client.twitch.notifyList[entry].boxArt = undefined;
            client.twitch.notifyList[entry].messageSent = false;
            await prisma.twitchNotify.update({
              where: { twitchId: entry },
              select: { live: true, sent: true },
              data: { live: false, sent: false }
            });
          }
        }
      });
  }
}
