import { ApplyOptions } from '@sapphire/decorators';
import {
  ApiRequest,
  ApiResponse,
  methods,
  Route,
  RouteOptions
} from '@sapphire/plugin-api';

@ApplyOptions<RouteOptions>({ route: '' })
export class HelloWorld extends Route {
  public [methods.GET](_request: ApiRequest, response: ApiResponse) {
    response.json({ message: 'Hello World' });
  }
}
