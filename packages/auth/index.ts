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
	auth,
	CSRF_experimental
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
		session: ({ session, user }) => ({
			...session,
			user: {
				...session.user,
				id: user.id,
				discordId: user.discordId
			}
		})

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
