import { ApplyOptions } from '@sapphire/decorators';
import {
  methods,
  Route,
  RouteOptions,
  type ApiRequest,
  type ApiResponse
} from '@sapphire/plugin-api';
import prisma from '../lib/prisma';

@ApplyOptions<RouteOptions>({ route: 'playlist' })
export class PlaylistRoute extends Route {
  public async [methods.GET](_request: ApiRequest, response: ApiResponse) {
    const { userId, name } = _request.params;
    const playlist = await prisma.playlist.findFirst({
      where: {
        userId,
        name
      },
      select: { songs: true }
    });

    if (!playlist) {
      return response.status(404).json({ message: 'Playlist not found' });
    }

    response.json({ playlist });
  }

  public [methods.POST](_request: ApiRequest, response: ApiResponse) {
    response.json({ message: 'Hello World' });
  }
}
