import { ApplyOptions } from '@sapphire/decorators';
import {
  methods,
  Route,
  RouteOptions,
  type ApiRequest,
  type ApiResponse
} from '@sapphire/plugin-api';
import prisma from '../lib/prisma';

@ApplyOptions<RouteOptions>({ route: 'guilds' })
export class GuildsRoute extends Route {
  public async [methods.GET](_request: ApiRequest, response: ApiResponse) {
    const { ownerId } = _request.query;
    const guilds = await prisma.guild.findMany({
      where: {
        ownerId: ownerId as string
      }
    });

    if (!guilds) {
      return response
        .status(404)
        .json({ message: 'An error occured when trying to fetch guilds' });
    }

    response.json(guilds);
  }
}
