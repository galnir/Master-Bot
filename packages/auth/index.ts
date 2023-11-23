// @ts-nocheck
import Discord, { type DiscordProfile } from '@auth/core/providers/discord';
import type { DefaultSession as DefaultSessionType } from '@auth/core/types';
import { PrismaAdapter } from '@auth/prisma-adapter';
import { prisma } from '@master-bot/db';
import NextAuth from 'next-auth';

import { env } from './env.mjs';

export type { Session } from 'next-auth';

// Update this whenever adding new providers so that the client can
export const providers = ['discord'] as const;
export type OAuthProviders = (typeof providers)[number];

declare module 'next-auth' {
	interface Session {
		user: {
			id: string;
			discordId: string;
		} & DefaultSessionType['user'];
	}
}

const scope = ['identify', 'guilds', 'email'].join(' ');

export const {
	handlers: { GET, POST },
	auth
} = NextAuth({
	adapter: {
		...PrismaAdapter(prisma),
		createUser: async data => {
			return await prisma.user.upsert({
				where: { discordId: data.discordId },
				update: data,
				create: data
			});
		}
	},
	providers: [
		Discord({
			clientId: env.DISCORD_CLIENT_ID,
			clientSecret: env.DISCORD_CLIENT_SECRET,
			authorization: {
				params: {
					scope
				}
			},
			profile(profile: DiscordProfile) {
				return {
					id: profile.id,
					name: profile.username,
					email: profile.email,
					image: profile.avatar,
					discordId: profile.id
				};
			}
		})
	],
	callbacks: {
		session: async ({ session, user }) => {
			const account = await prisma.account.findUnique({
				where: {
					userId: user.id
				}
			});

			if (account?.expires_at * 1000 < Date.now()) {
				// refresh token
				try {
					const response = await fetch(
						'https://discord.com/api/v10/oauth2/token',
						{
							headers: {
								'Content-Type': 'application/x-www-form-urlencoded'
							},
							method: 'POST',
							body: new URLSearchParams({
								grant_type: 'refresh_token',
								client_id: env.DISCORD_CLIENT_ID,
								client_secret: env.DISCORD_CLIENT_SECRET,
								refresh_token: account.refresh_token
							})
						}
					);

					if (!response.ok) {
						throw new Error('Failed to refresh token');
					}

					const data = await response.json();

					await prisma.account.update({
						where: {
							userId: user.id
						},
						data: {
							access_token: data.access_token,
							refresh_token: data.refresh_token,
							expires_at: data.expires_in
						}
					});
				} catch (error) {
					console.log(error);
				}
			}

			return {
				...session,
				user: {
					...session.user,
					id: user.id,
					discordId: user.discordId
				}
			};
		}

		// @TODO - if you wanna have auth on the edge
		// jwt: ({ token, profile }) => {
		//   if (profile?.id) {
		//     token.id = profile.id;
		//     token.image = profile.picture;
		//   }
		//   return token;
		// },

		// @TODO
		// authorized({ request, auth }) {
		//   return !!auth?.user
		// }
	}
});
