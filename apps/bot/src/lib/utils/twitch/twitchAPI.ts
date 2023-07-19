import { URLSearchParams } from "url";
import axios, { AxiosInstance } from "axios";

import type {
  TwitchGame,
  TwitchGamesResponse,
  TwitchStream,
  TwitchStreamsResponse,
  TwitchToken,
  TwitchUser,
  TwitchUsersResponse,
} from "./twitchAPI-types";

// Max Number per call is 100 entries
const chunk_size = 100;

export class TwitchAPI {
  _helix?: AxiosInstance;
  _auth?: AxiosInstance;

  private client_id?: string;
  private client_secret?: string;

  constructor(client_id?: string, client_secret?: string) {
    if (!client_id || !client_secret) {
      return;
    }
    this.client_id = client_id;
    this.client_secret = client_secret;

    this._auth = axios.create({
      baseURL: "https://id.twitch.tv/oauth2",
    });

    this._helix = axios.create({
      baseURL: "https://api.twitch.tv/helix",
      headers: {
        "Client-ID": client_id,
      },
    });

    this._auth.interceptors.response.use(
      (response) => {
        return response.data;
      },
      (error) => {
        throw error.response.data;
      },
    );

    this._helix.interceptors.response.use(
      (response) => {
        return response.data;
      },
      (error) => {
        throw error.response.data;
      },
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
          grant_type: "client_credentials",
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
    token,
  }: {
    ids?: string[];
    logins?: string[];
    token: string;
  }): Promise<TwitchUser[]> => {
    return new Promise(async (resolve, reject) => {
      let result: TwitchUser[] = [];
      if (!this.client_id || !this.client_secret || !this._auth || !this._helix)
        return;
      try {
        if (!ids.length && !logins.length)
          throw new Error(`Empty array in the "ids" or "logins" property`);

        const numTotal: number = ids.length ?? 0 + logins.length ?? 0;
        let offset: number = 0;

        for (let i = 0; i < numTotal; i += chunk_size) {
          const chunkIds = ids.slice(i, i + chunk_size);

          if (i == 0) offset = chunkIds.length;

          const chunkLogins = logins.slice(
            i - i == 0 ? 0 : offset,
            i + (chunk_size - chunkIds.length - i == 0 ? 0 : offset),
          );

          if (chunkIds.length + chunkLogins.length > chunk_size)
            throw new Error("Query Exceeded the chunk size of 100");

          const query = new URLSearchParams();

          chunkIds.forEach((user_id: string) => query.append("id", user_id));
          chunkLogins.forEach((user_login: string) =>
            query.append("login", user_login),
          );

          const response: TwitchUsersResponse = await this._helix.get(
            `/users?${query}`,
            {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            },
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
    token,
  }: {
    token: string;
    id?: string;
    login?: string;
  }): Promise<TwitchUser> => {
    return new Promise(async (resolve, reject) => {
      if (!this.client_id || !this.client_secret || !this._auth || !this._helix)
        return;
      try {
        if (!id && !login)
          throw new Error(`Empty string in the "id" or "login" property`);

        const response: TwitchUsersResponse = await this._helix.get(
          `/users?${login ? "login=" + login : "id=" + id}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          },
        );
        resolve(response.data[0]!);
      } catch (error) {
        reject(error);
      }
    });
  };

  getGame = async ({
    id,
    token,
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
              Authorization: `Bearer ${token}`,
            },
          },
        );

        resolve(response.data[0]!);
      } catch (error) {
        reject(error);
      }
    });
  };

  getGames = async ({
    ids,
    token,
  }: {
    ids: string[];
    token: string;
  }): Promise<TwitchGame[]> => {
    return new Promise(async (resolve, reject) => {
      if (!this.client_id || !this.client_secret || !this._auth || !this._helix)
        return;

      let result: TwitchGame[] = [];
      try {
        const numTotal: number = ids.length;

        for (let i = 0; i < numTotal; i += chunk_size) {
          const chunkIds = ids.slice(i, i + chunk_size);
          const query = new URLSearchParams();

          chunkIds.forEach((id: string) => query.append("id", id));

          const response: TwitchGamesResponse = await this._helix.get(
            `/games?${query}`,
            {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            },
          );

          result = [...result, ...response.data];
        }
        resolve(result);
      } catch (error) {
        reject(error);
      }
    });
  };

  getStream = async ({
    login,
    token,
  }: {
    login: string;
    token: string;
  }): Promise<TwitchStream> => {
    return new Promise(async (resolve, reject) => {
      try {
        if (
          !this.client_id ||
          !this.client_secret ||
          !this._auth ||
          !this._helix
        )
          return;

        const response: TwitchStreamsResponse = await this._helix.get(
          `/streams?user_login=${login}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          },
        );

        resolve(response.data[0]!);
      } catch (error) {
        reject(error);
      }
    });
  };

  getStreamingUsers = async ({
    user_ids = [],
    user_logins = [],
    token,
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
        if (!user_ids.length && !user_logins.length)
          throw new Error(
            `Empty array in the "user_ids" or "user_logins" property`,
          );

        const numTotal: number = user_ids.length ?? 0 + user_logins.length ?? 0;
        let offset: number = 0;

        for (let i = 0; i < numTotal; i += chunk_size) {
          const chunkIds = user_ids.slice(i, i + chunk_size);

          if (i == 0) offset = chunkIds.length;

          const chunkLogins = user_logins.slice(
            i - i == 0 ? 0 : offset,
            i + (chunk_size - chunkIds.length - i == 0 ? 0 : offset),
          );

          if (chunkIds.length + chunkLogins.length > chunk_size)
            throw new Error("Query Exceeded the chunk size of 100");

          const query = new URLSearchParams();

          chunkIds.forEach((user_id: string) =>
            query.append("user_id", user_id),
          );

          chunkLogins.forEach((user_login: string) =>
            query.append("user_login", user_login),
          );

          const response: TwitchStreamsResponse = await this._helix.get(
            `/streams?${query}`,
            {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            },
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
