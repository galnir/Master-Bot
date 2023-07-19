import axios from "axios";

import { prisma } from "@master-bot/db";

import { env } from "../env.mjs";

const axiosInstance = axios.create();

// Refresh access token if expired and retry the request
axiosInstance.interceptors.response.use(undefined, async (error) => {
  // console.log('error is', error);
  if (error.response && error.response.status === 401) {
    const clientId = env.DISCORD_CLIENT_ID;
    const clientSecret = env.DISCORD_CLIENT_SECRET;

    if (!clientId || !clientSecret) {
      return Promise.reject(error);
    }

    const originalRequest = error.config;
    const refreshToken = originalRequest.headers["X-Refresh-Token"];
    const userId = originalRequest.headers["X-User-Id"];

    // Remove the custom headers
    delete originalRequest.headers["X-Refresh-Token"];
    delete originalRequest.headers["X-User-Id"];

    // Check if we've already tried to refresh the token for this request
    if (!originalRequest._retry) {
      originalRequest._retry = true;

      // Refresh the access token using your refreshAccessToken function
      const newTokens = await refreshAccessToken(
        clientId,
        clientSecret,
        refreshToken,
      );

      if (newTokens) {
        // Update the access token and refresh token in your database
        await prisma.user.update({
          where: {
            id: userId,
          },
          data: {},
        });

        // Update the access token in the original request's headers
        originalRequest.headers.Authorization = `Bearer ${newTokens.accessToken}`;

        // Retry the original request with the new access token
        return axiosInstance(originalRequest);
      }
    }
  }

  // If the error isn't due to an expired token, pass it along
  return Promise.reject(error);
});

async function refreshAccessToken(
  clientId: string,
  clientSecret: string,
  refreshToken: string,
) {
  try {
    const response = await axios.post(
      "https://discord.com/api/oauth2/token",
      null,
      {
        params: {
          client_id: clientId,
          client_secret: clientSecret,
          grant_type: "refresh_token",
          refresh_token: refreshToken,
        },
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
      },
    );

    const {
      access_token,
      refresh_token: newRefreshToken,
      expires_in,
    } = response.data;

    // Update the access and refresh tokens in your database

    return {
      accessToken: access_token,
      refreshToken: newRefreshToken,
      expiresIn: expires_in,
    };
  } catch (error) {
    console.error("Error refreshing access token:", error);
    return null;
  }
}

export default axiosInstance;
