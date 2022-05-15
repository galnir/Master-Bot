import type { TwitchGame, TwitchStream } from './twitchAPI-types';
import { TwitchEmbed } from './TwitchEmbed';
import { container } from '@sapphire/framework';
import type { MessageChannel } from './../../../index';
import prisma from '../../prisma';
import type { Message } from 'discord.js';

// Twitch ids are non changeable, usernames are not good for reference
export async function notify(query: string[]) {
  const { client } = container;
  const token = client.twitch.auth.access_token;
  if (!token) return;
  if (query.length > 0) {
    const streamMap = new Map();
    const gameMap = new Map();
    const gameIDs: string[] = [];
    await client.twitch.api
      .getStreamingUsers({
        user_ids: query,
        token: token
      })
      .then(async (response: TwitchStream[]) => {
        response.reduce((obj, user) => streamMap.set(user.user_id, user), {});
        response.forEach((streamer, index) => {
          gameIDs.push(streamer.game_id);
        });
        await client.twitch.api
          .getGames({ ids: gameIDs, token: token })
          .then(gameResponse => {
            gameResponse.reduce((obj, game) => gameMap.set(game.id, game), {});
          });
        console.log(gameIDs, gameMap);
        for (const entry of query) {
          const stream: TwitchStream = await streamMap.get(entry);
          const game: TwitchGame = await gameMap.get(stream?.game_id);
          client.twitch.notifyList[entry] = {
            live: stream ? true : false,
            user_name: client.twitch.notifyList[entry].user_name,
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
            // Grab stored info before its changed
            const prevGame = client.twitch.notifyList[entry].gameName;
            const prevTitle = client.twitch.notifyList[entry].title;

            // change Data
            client.twitch.notifyList[entry].gameName = stream.game_name;
            client.twitch.notifyList[entry].title = stream.title;
            client.twitch.notifyList[entry].user_name = stream.user_name;

            if (client.twitch.notifyList[entry].messageSent == false) {
              client.twitch.notifyList[entry].boxArt = game.box_art_url;

              // Run through ChannelIds List of Entry/Streamer
              for (const channelToMsg of client.twitch.notifyList[entry]
                .sendTo) {
                const channel = client.channels.cache.get(
                  channelToMsg
                ) as MessageChannel;

                if (channel) {
                  const twitchMsg = new TwitchEmbed(
                    stream,
                    client.twitch.notifyList[entry].user_name!,
                    client.twitch.notifyList[entry].logo,
                    game.box_art_url,
                    false, // Offline
                    false // Stream Update
                  );

                  await channel
                    .send({
                      embeds: [await twitchMsg.TwitchEmbed()]
                    })
                    .then((message: Message) => {
                      // Store the Message ID
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

              // Update DataBase
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
                  client.twitch.notifyList[entry].boxArt = game.box_art_url;
                }
                const twitchMsg = new TwitchEmbed(
                  stream,
                  client.twitch.notifyList[entry].user_name!,
                  client.twitch.notifyList[entry].logo,
                  client.twitch.notifyList[entry].boxArt!,
                  false, // Offline
                  true // Stream Update
                );

                // Run through stored Messages
                if (client.twitch.notifyList[entry].messageHandler)
                  for (const channelId in client.twitch.notifyList[entry]
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
              client.twitch.notifyList[entry].user_name!,
              client.twitch.notifyList[entry].logo,
              client.twitch.notifyList[entry].boxArt!,
              true, // offline
              false // Stream Update
            );

            // Run through Stored Messages
            if (client.twitch.notifyList[entry].messageHandler)
              for (const channelId in client.twitch.notifyList[entry]
                .messageHandler) {
                client.channels.fetch(channelId).then(async channel => {
                  const msgChannel = channel as MessageChannel;

                  for (const messageId in client.twitch.notifyList[entry]
                    .messageHandler[channelId].messageIds) {
                    await msgChannel?.messages
                      .edit(
                        client.twitch.notifyList[entry].messageHandler![
                          channelId
                        ].messageIds[messageId],
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
            // Update DataBase
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
