import type { MessageChannel } from '../../index';
import { ApplyOptions } from '@sapphire/decorators';
import { Command, CommandOptions, container } from '@sapphire/framework';
import type { GuildChannel } from 'discord.js';
import { isTextBasedChannel } from '@sapphire/discord.js-utilities';
import { notify } from '../../lib/utils/twitch/notifyChannel';
import { trpcNode } from '../../trpc';

@ApplyOptions<CommandOptions>({
  name: 'add-streamer',
  description: 'Adicionar um alerta de Stream do seu streamer favorito do Twitch!!',
  requiredUserPermissions: 'MODERATE_MEMBERS',
  preconditions: ['GuildOnly', 'isCommandDisabled']
})
export class AddStreamerCommand extends Command {
  public override async chatInputRun(
    interaction: Command.ChatInputCommandInteraction
  ) {
    const streamerName = interaction.options.getString('streamer-name', true);
    const channelData = interaction.options.getChannel('channel-name', true);
    const { client } = container;

    let isError = false;
    let user;
    try {
      user = await client.twitch.api.getUser({
        login: streamerName,
        token: client.twitch.auth.access_token
      })
      .catch(async error => {
        isError = true;
        if (error.status == 400) {
          return await interaction.reply({
            content: `:x: "${streamerName}" foi invalido, tente novamente.`
          });
        }
        if (error.status === 401) {
          return await interaction.reply({
            content: `:x: Você não está autorizado a usar este comando.`
          });
        }
        if (error.status == 429) {
          return await interaction.reply({
            content:
              ':x: Limite de avaliação excedido. Tente novamente em alguns minutos.'
          });
        }
        if (error.status == 500) {
          return await interaction.reply({
            content: `:x: Os serviços do Twitch estão indisponíveis no momento. Tente novamente mais tarde.`
          });
        } else {
          return await interaction.reply({
            content: `:x: Alguma coisa deu errada!`
          });
        }
      });
    } catch (error: any) {
      isError = true;
      if (error.status == 400) {
        return await interaction.reply({
          content: `:x: "${streamerName}" was Invalid, Please try again.`
        });
      }
      if (error.status === 401) {
        return await interaction.reply({
          content: `:x: You are not authorized to use this command.`
        });
      }
      if (error.status == 429) {
        return await interaction.reply({
          content: ':x: Rate Limit exceeded. Please try again in a few minutes.'
        });
      }
      if (error.status == 500) {
        return await interaction.reply({
          content: `:x: Twitch service's are currently unavailable. Please try again later.`
        });
      } else {
        return await interaction.reply({
          content: `:x: Something went wrong.`
        });
      }
    }

    if (isError) return;
    if (!user)
      return await interaction.reply({
        content: `:x: ${streamerName} não foi achado.`
      });
    if (!isTextBasedChannel(channelData as GuildChannel))
      return await interaction.reply({
        content: `:x: Não é possível enviar mensagens para ${channelData.name}`
      });

    const guildDB = await trpcNode.guild.getGuild.query({
      id: interaction.guild!.id
    });

    if (!guildDB.guild) {
      return await interaction.reply({
        content: `:x: Alguma coisa deu errada!`
      });
    }

    // check if streamer is already on notify list
    if (guildDB?.guild.notifyList.includes(user.id))
      return await interaction.reply({
        content: `:x: ${user.display_name} já está na sua lista de Notificações`
      });

    // make sure channel is not already on notify list
    for (const twitchChannel in client.twitch.notifyList) {
      for (const channelToMsg of client.twitch.notifyList[twitchChannel]
        .sendTo) {
        const query = client.channels.cache.get(channelToMsg) as MessageChannel;
        if (query)
          if (query.guild.id == interaction.guild?.id) {
            if (twitchChannel == user.id)
              return await interaction.reply({
                content: `:x: **${user.display_name}** já tem uma notificação em **#${query.name}**`
              });
          }
      }
    }
    // make sure no one else is already sending alerts about this streamer
    if (client.twitch.notifyList[user.id]?.sendTo.includes(channelData.id))
      return await interaction.reply({
        content: `:x: **${user.display_name}** já está enviando mensagens para ${channelData.name}`
      });

    let channelArray;
    if (client.twitch.notifyList[user.id])
      channelArray = [
        ...client.twitch.notifyList[user.id].sendTo,
        ...[channelData.id]
      ];
    else channelArray = [channelData.id];

    // add notification to twitch object on client
    client.twitch.notifyList[user.id]
      ? (client.twitch.notifyList[user.id].sendTo = channelArray)
      : (client.twitch.notifyList[user.id] = {
          sendTo: [channelData.id],
          live: false,
          logo: user.profile_image_url,
          messageSent: false,
          messageHandler: {}
        });

    // add notification to database
    await trpcNode.twitch.create.mutate({
      userId: user.id,
      userImage: user.profile_image_url,
      channelId: channelData.id,
      sendTo: client.twitch.notifyList[user.id].sendTo
    });

    // add notification to guild on database
    const concatedArray = guildDB.guild.notifyList.concat([user.id]);

    const guild = interaction.guild!;
    await trpcNode.guild.createViaTwitchNotification.mutate({
      name: guild.name,
      guildId: guild.id,
      notifyList: concatedArray,
      ownerId: guild.ownerId,
      userId: interaction.user.id
    });

    await interaction.reply({
      content: `**${user.display_name}** A Notificação da Live será enviada para **#${channelData.name}**`
    });
    const newQuery: string[] = [];
    // pickup newly added entries
    for (const key in client.twitch.notifyList) {
      newQuery.push(key);
    }
    await notify(newQuery);
    return;
  }

  public override registerApplicationCommands(
    registry: Command.Registry
  ): void {
    if (!process.env.TWITCH_CLIENT_ID || !process.env.TWITCH_CLIENT_SECRET) {
      return;
    }

      options: [
        {
          name: 'streamer-name',
          description: 'Qual é o nome do streamer da Twitch?',
          type: 'STRING',
          required: true
        },
        {
          name: 'channel-name',
          description:
            'Qual é o nome do Canal para o qual você gostaria que o Alerta fosse enviado?',
          type: 'CHANNEL',
          required: true
        }
      ]
    });
  }
}
