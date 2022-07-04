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
    const { name, id } = _request.query;
    const playlist = await prisma.playlist.findFirst({
      where: {
        userId: id as string,
        name: name as string
      },
      select: { songs: true }
    });

    if (!playlist) {
      return response.status(404).json({ message: 'Playlist not found' });
    }

    response.json({ playlist });
  }

  public async [methods.POST](_request: ApiRequest, response: ApiResponse) {
    const { name, id } = _request.query;
    const playlist = await prisma.playlist.create({
      data: {
        name: name as string,
        user: { connect: { id: id as string } }
      }
    });

    if (!playlist) {
      return response
        .status(404)
        .json({ message: 'An error occured when trying to create playlist' });
    }

    response.json(playlist);
  }

  public async [methods.DELETE](_request: ApiRequest, response: ApiResponse) {
    const { name, id } = _request.query;
    const playlist = await prisma.playlist.deleteMany({
      where: {
        userId: id as string,
        name: name as string
      }
    });

    if (!playlist) {
      return response
        .status(404)
        .json({ message: 'An error occured when trying to delete playlist' });
    }

    response.json(true);
  }
}
