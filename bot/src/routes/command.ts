//import prisma from '../lib/prisma';
import { ApplyOptions } from '@sapphire/decorators';
import {
  methods,
  Route,
  RouteOptions,
  type ApiRequest,
  type ApiResponse
} from '@sapphire/plugin-api';
import prisma from '../lib/prisma';

@ApplyOptions<RouteOptions>({ route: 'command' })
export class CommandRoute extends Route {
  public async [methods.PATCH](_request: ApiRequest, response: ApiResponse) {
    const body: any = _request.body;
    const { id } = _request.query;
    const data = JSON.parse(body);
    const { enabled, commandID }: { enabled: string; commandID: string } = data;

    const dbResponse = await prisma.guild.findUnique({
      where: {
        id: id as string
      },
      select: {
        disabledCommands: true
      }
    });

    if (!dbResponse) {
      return response
        .status(404)
        .json({ message: 'An error occured when trying to update command' });
    }

    let updatedGuild;

    if (enabled === 'true') {
      updatedGuild = await prisma.guild.update({
        where: {
          id: id as string
        },
        data: {
          disabledCommands: {
            set: dbResponse.disabledCommands.filter(
              commandId => commandId !== commandID
            )
          }
        }
      });
    } else if (enabled === 'false') {
      updatedGuild = await prisma.guild.update({
        where: {
          id: id as string
        },
        data: {
          disabledCommands: {
            set: [...dbResponse.disabledCommands, commandID]
          }
        }
      });
    }

    return response.json(updatedGuild);
  }
}
