import { ApplyOptions } from '@sapphire/decorators';
import {
  ApiRequest,
  ApiResponse,
  methods,
  Route,
  RouteOptions
} from '@sapphire/plugin-api';
import prisma from '../lib/prisma';
import { container } from '@sapphire/framework';

@ApplyOptions<RouteOptions>({ route: 'hub' })
export class HubRoute extends Route {
  public async [methods.POST](_request: ApiRequest, response: ApiResponse) {
    const { guildID, name } = _request.query;

    const guildDB = await prisma.guild.findUnique({
      where: {
        id: guildID as string
      }
    });

    if (guildDB?.hub) {
      return response.status(400).json({ message: 'Hub already exists' });
    }

    const guild = await container.client.guilds.fetch(guildID as string);
    const channels = guild.channels;

    try {
      const category = await channels.create(name as string, {
        type: 'GUILD_CATEGORY'
      });

      const hubChannel = await channels.create('Hub', {
        type: 'GUILD_VOICE',
        parent: category,
        permissionOverwrites: [
          {
            id: (
              await guild.roles.fetch()
            ).find(role => role.name === '@everyone')!.id,
            deny: ['SPEAK']
          }
        ]
      });

      const updatedGuild = await prisma.guild.update({
        where: {
          id: guildID as string
        },
        data: {
          hub: category.id,
          hubChannel: hubChannel.id
        }
      });

      return response.json({ guild: updatedGuild });
    } catch (err) {
      return response
        .status(400)
        .json({ message: 'Something went wrong, please try again later' });
    }
  }

  public async [methods.DELETE](_request: ApiRequest, response: ApiResponse) {
    const { guildID } = _request.query;

    const guildDB = await prisma.guild.findUnique({
      where: {
        id: guildID as string
      }
    });

    if (!guildDB?.hub || !guildDB?.hubChannel) {
      return response.status(400).json({ message: 'Hub does not exist' });
    }

    const guild = await container.client.guilds.fetch(guildID as string);
    const channels = guild.channels;

    try {
      const hub = await channels.fetch(guildDB?.hub);
      const hubChannel = await channels.fetch(guildDB?.hubChannel);

      Promise.all([hub?.delete(), hubChannel?.delete()])
        .then(async () => {
          await prisma.guild.update({
            where: {
              id: guildID as string
            },
            data: {
              hub: null,
              hubChannel: null
            }
          });

          return response.json({ message: 'Hub deleted' });
        })
        .catch(() => {
          return response
            .status(400)
            .json({ message: 'Something went wrong, please try again later' });
        });
    } catch (err) {
      return response
        .status(400)
        .json({ message: 'Something went wrong, please try again later' });
    }
  }
}
