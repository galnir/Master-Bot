import { ApplyOptions } from '@sapphire/decorators';
import {
  methods,
  Route,
  RouteOptions,
  type ApiRequest,
  type ApiResponse
} from '@sapphire/plugin-api';
import { container } from '@sapphire/framework';

@ApplyOptions<RouteOptions>({ route: 'channels' })
export class ChannelsRoute extends Route {
  public async [methods.GET](_request: ApiRequest, response: ApiResponse) {
    const { guildID } = _request.query;

    const guild = await container.client.guilds.fetch(guildID as string);

    const channels = guild.channels.cache.filter(
      channel => channel.type === 'GUILD_TEXT'
    );

    if (!channels) {
      return response.status(404).json({ message: 'No text channels found' });
    }

    return response.json(channels);
  }
}
