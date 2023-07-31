import axios from 'axios';

import { prisma } from '@master-bot/db';

import { env } from '../env.mjs';

const baseURL = 'https://discord.com/api/v10'; // Update to the appropriate Discord API version

const discordApi = axios.create({
	baseURL
});

async function refreshAccessToken(refreshToken: string, userId: string) {
	try {
		const response = await discordApi.post('/oauth2/token', null, {
			params: {
				client_id: env.DISCORD_CLIENT_ID,
				client_secret: env.DISCORD_CLIENT_SECRET,
				grant_type: 'refresh_token',
				refresh_token: refreshToken
			}
		});

		const {
			access_token,
			refresh_token: newRefreshToken,
			expires_in
		} = response.data;

		// Update the access and refresh tokens in the database
		await prisma.account.update({
			where: {
				userId
			},
			data: {
				access_token,
				refresh_token: newRefreshToken,
				expires_at: expires_in
			}
		});

		return {
			accessToken: access_token,
			refreshToken: newRefreshToken,
			expiresIn: expires_in
		};
	} catch (error) {
		console.error('Error refreshing access token:', error);
		return null;
	}
}

async function updateUserTokens(
	newTokens: {
		accessToken: string;
		refreshToken: string;
		expiresIn: number;
	},
	userId: string
) {
	try {
		const updatedAccount = await prisma.account.update({
			where: {
				userId
			},
			data: {
				access_token: newTokens.accessToken,
				refresh_token: newTokens.refreshToken,
				expires_at: newTokens.expiresIn
			}
		});

		return updatedAccount;
	} catch (error) {
		console.error('Error updating user tokens:', error);
		return null;
	}
}

discordApi.interceptors.response.use(
	response => {
		// if response is ok return it
		return response;
	},
	async error => {
		const originalRequest = error.config;

		// if error is 401, token is expired or 50025
		if (error.response.status >= 401 && !originalRequest._retry) {
			originalRequest._retry = true;

			const { 'X-User-Id': userId, 'X-Refresh-Token': refreshToken } =
				originalRequest.headers;

			if (typeof userId !== 'string' || typeof refreshToken !== 'string') {
				throw error;
			}

			const newTokens = await refreshAccessToken(refreshToken, userId);

			if (!newTokens?.accessToken) {
				throw error;
			}

			// Save the new access token and refresh token to the DB
			try {
				await updateUserTokens(newTokens, userId);
			} catch {
				throw error;
			}

			// Set the new access token in the header and retry the original request
			originalRequest.headers[
				'Authorization'
			] = `Bearer ${newTokens.accessToken}`;

			// eslint-disable-next-line @typescript-eslint/no-unsafe-argument
			return discordApi(originalRequest);
		}
		return Promise.reject(error);
	}
);

export { discordApi };
