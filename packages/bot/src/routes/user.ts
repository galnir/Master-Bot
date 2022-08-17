import { ApplyOptions } from '@sapphire/decorators';
import {
  methods,
  Route,
  RouteOptions,
  type ApiRequest,
  type ApiResponse
} from '@sapphire/plugin-api';
import prisma from '../lib/prisma';

@ApplyOptions<RouteOptions>({ route: 'user' })
export class UserRoute extends Route {
  public async [methods.GET](_request: ApiRequest, response: ApiResponse) {
    const { id } = _request.query;
    const user = await prisma.user.findFirst({
      where: { id: id as string },
      select: {
        playlists: true,
        id: true,
        guilds: true,
        username: true
      }
    });

    if (!user) {
      return response
        .status(404)
        .json({ message: 'An error occured when trying to get user' });
    }

    response.json(user);
  }

  public async [methods.POST](_request: ApiRequest, response: ApiResponse) {
    const { id, username } = _request.query;

    const user = await prisma.user.upsert({
      where: {
        id: id as string
      },
      update: {},
      create: {
        id: id as string,
        username: username as string
      }
    });

    if (!user) {
      return response
        .status(404)
        .json({ message: 'An error occured when trying create a user' });
    }

    response.json(user);
  }

  public async [methods.DELETE](_request: ApiRequest, response: ApiResponse) {
    const { id } = _request.query;

    try {
      await prisma.user.delete({
        where: { id: id as string }
      });
    } catch (e) {
      return response
        .status(404)
        .json({ message: 'An error occured when trying to delete user' });
    }

    response.json({ message: 'User deleted' });
  }
}
