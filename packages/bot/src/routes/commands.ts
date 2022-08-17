import { container } from '@sapphire/framework';

import { ApplyOptions } from '@sapphire/decorators';
import {
  methods,
  Route,
  RouteOptions,
  type ApiRequest,
  type ApiResponse
} from '@sapphire/plugin-api';

@ApplyOptions<RouteOptions>({ route: 'commands' })
export class CommandsRoute extends Route {
  public async [methods.GET](_request: ApiRequest, response: ApiResponse) {
    const application = container.client.application;

    if (!application) {
      return response
        .status(404)
        .json({ message: 'Some weird error has occured' });
    }

    const commandsCache = application.commands.cache;

    const commands = commandsCache.map(command => {
      return {
        id: command.id,
        name: command.name,
        description: command.description
      };
    });

    response.json(commands);
  }
}
