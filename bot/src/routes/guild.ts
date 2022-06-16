import { ApplyOptions } from '@sapphire/decorators';
import {
  methods,
  Route,
  RouteOptions,
  type ApiRequest,
  type ApiResponse
} from '@sapphire/plugin-api';
import prisma from '../lib/prisma';

@ApplyOptions<RouteOptions>({ route: 'guild' })
export class GuildRoute extends Route {
  public async [methods.GET](_request: ApiRequest, response: ApiResponse) {
    const { id } = _request.query;
    const guild = await prisma.guild.findFirst({
      where: {
        id: id as string
      }
    });

    if (!guild) {
      return response
        .status(404)
        .json({ message: 'An error occured when trying to fetch a guild' });
    }

    response.json(guild);
  }

  public async [methods.POST](_request: ApiRequest, response: ApiResponse) {
    const { id, ownerId, name } = _request.query;
    const guild = await prisma.guild.upsert({
      where: {
        id: id as string
      },
      update: {},
      create: {
        id: id as string,
        ownerId: ownerId as string,
        volume: 100,
        name: name as string
      }
    });

    if (!guild) {
      return response
        .status(404)
        .json({ message: 'An error occured when trying to create guild' });
    }

    response.json(guild);
  }

  public async [methods.DELETE](_request: ApiRequest, response: ApiResponse) {
    const { id } = _request.query;

    try {
      await prisma.guild.delete({
        where: { id: id as string }
      });
    } catch (e) {
      return response
        .status(404)
        .json({ message: 'An error occured when trying to delete guild' });
    }

    response.json({ message: 'Guild deleted' });
  }
}
