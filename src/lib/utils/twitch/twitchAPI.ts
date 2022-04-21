import axios, { AxiosInstance } from 'axios';
import { URLSearchParams } from 'url';
import type {
  TwitchToken,
  TwitchUser,
  TwitchUsersResponse,
  TwitchStream,
  TwitchStreamsResponse,
  TwitchGame,
  TwitchGamesResponse
} from './twitchAPI-types';

// Max Number per call is 100 users
const chunk_size = 100;

export class TwitchClient {
  _helix: AxiosInstance;
  _auth: AxiosInstance;

  private client_id: string;
  private client_secret: string;

  constructor(client_id: string, client_secret: string) {
    this.client_id = client_id;
    this.client_secret = client_secret;

    this._auth = axios.create({
      baseURL: 'https://id.twitch.tv/oauth2'
    });

    this._helix = axios.create({
      baseURL: 'https://api.twitch.tv/helix',
      headers: {
        'Client-ID': client_id
      }
    });

    this._auth.interceptors.response.use(
      response => {
        return response.data;
      },
      error => {
        throw error.response.data;
      }
    );

    this._helix.interceptors.response.use(
      response => {
        return response.data;
      },
      error => {
        throw error.response.data;
      }
    );
  }

  getAccessToken = (scopes: string): Promise<TwitchToken> => {
    return new Promise(async (resolve, reject) => {
      try {
        const query = new URLSearchParams({
          client_id: this.client_id,
          client_secret: this.client_secret,
          scope: scopes,
          grant_type: 'client_credentials'
        });

        const response: TwitchToken = await this._auth.post(`/token?${query}`);
        resolve(response);
      } catch (error) {
        reject(error);
      }
    });
  };

  getUsers = async ({
    ids = [],
    logins = [],
    token
  }: {
    ids?: string[];
    logins?: string[];
    token: string;
  }): Promise<TwitchUser[]> => {
    return new Promise(async (resolve, reject) => {
      if (ids.length && logins.length === 0) resolve([]);

      let result: TwitchUser[] = [];
      try {
        if (ids)
          for (let i = 0; i < ids.length; i += chunk_size) {
            const chunk = ids.slice(i, i + chunk_size);

            const query = new URLSearchParams({
              first: String(chunk_size)
            });
            chunk.forEach((id: string) => query.append('id', id));

            const response: TwitchUsersResponse = await this._helix.get(
              `/users?${query}`,
              {
                headers: {
                  Authorization: `Bearer ${token}`
                }
              }
            );

            result = [...result, ...response.data];
          }

        resolve(result);
      } catch (error) {
        reject(error);
      }
    });
  };

  getUser = async ({
    login,
    id,
    token
  }: {
    token: string;
    id?: string;
    login?: string;
  }): Promise<TwitchUser> => {
    return new Promise(async (resolve, reject) => {
      if (!id && !login)
        new Error(`Function requires property "id" or "login"`);
      try {
        const response: TwitchUsersResponse = await this._helix.get(
          `/users?${login ? 'login=' + login : 'id=' + id}`,
          {
            headers: {
              Authorization: `Bearer ${token}`
            }
          }
        );
        resolve(response.data[0]);
      } catch (err) {
        reject(err);
      }
    });
  };

  getGame = async ({
    id,
    token
  }: {
    id: string;
    token: string;
  }): Promise<TwitchGame> => {
    return new Promise(async (resolve, reject) => {
      try {
        const query = new URLSearchParams({ id });

        const response: TwitchGamesResponse = await this._helix.get(
          `/games?${query}`,
          {
            headers: {
              Authorization: `Bearer ${token}`
            }
          }
        );

        resolve(response.data[0]);
      } catch (error) {
        reject(error);
      }
    });
  };

  getStreamingUsers = async ({
    user_ids = [],
    user_logins = [],
    token
  }: {
    user_ids?: string[];
    user_logins?: string[];
    token: string;
  }): Promise<TwitchStream[]> => {
    return new Promise(async (resolve, reject) => {
      if (user_ids.length === 0) resolve([]);

      let result: TwitchStream[] = [];
      try {
        // 1 chunk is 100 users; each chunk is 1 call

        for (let i = 0; i < user_ids.length; i += chunk_size) {
          const chunk = user_ids.slice(i, i + chunk_size);

          const query = new URLSearchParams();
          chunk.forEach((user_id: string) => query.append('user_id', user_id));
          const response: TwitchStreamsResponse = await this._helix.get(
            `/streams?${query}`,
            {
              headers: {
                Authorization: `Bearer ${token}`
              }
            }
          );

          result = [...result, ...response.data];
        }
        resolve(result);
      } catch (error) {
        reject(error);
      }
    });
  };
}
