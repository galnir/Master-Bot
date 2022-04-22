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
  _helix: AxiosInstance | false;
  _auth: AxiosInstance | false;

  private client_id?: string;
  private client_secret?: string;

  constructor(client_id?: string, client_secret?: string) {
    if (!client_id || !client_secret) {
      this._auth = false;
      this._helix = false;
      return;
    }
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
      if (!this.client_id || !this.client_secret || !this._auth || !this._helix)
        return;
      try {
        const query = new URLSearchParams({
          client_id: this.client_id,
          client_secret: this.client_secret,
          scope: scopes,
          grant_type: 'client_credentials'
        });
        if (!this._auth || !this._helix) return;
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
      if (ids.length && logins.length === 0)
        reject(new Error(`Empty array in the "ids" or "logins" property`));

      let result: TwitchUser[] = [];
      if (!this.client_id || !this.client_secret || !this._auth || !this._helix)
        return;

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
        new Error(`Empty sting in the "id" or "login" property`);
      if (!this.client_id || !this.client_secret || !this._auth || !this._helix)
        return;
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
        if (
          !this.client_id ||
          !this.client_secret ||
          !this._auth ||
          !this._helix
        )
          return;

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
      if (!this.client_id || !this.client_secret || !this._auth || !this._helix)
        return;
      let result: TwitchStream[] = [];
      try {
        for (
          let i = 0;
          i < user_ids.length + user_logins.length;
          i += chunk_size
        ) {
          const chunkIds = user_ids.slice(i, i + chunk_size);
          const chunkLogins = user_logins.slice(
            i,
            i + (chunk_size - chunkIds.length)
          );

          const query = new URLSearchParams();
          chunkIds.forEach((user_id: string) =>
            query.append('user_id', user_id)
          );
          chunkLogins.forEach((user_login: string) =>
            query.append('user_login', user_login)
          );
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
