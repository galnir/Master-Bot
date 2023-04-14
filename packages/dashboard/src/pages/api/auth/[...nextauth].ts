// @ts-nocheck
import NextAuth, { type NextAuthOptions } from 'next-auth';
import DiscordProvider, { DiscordProfile } from 'next-auth/providers/discord';

// Prisma adapter for NextAuth
import { PrismaAdapter } from '@next-auth/prisma-adapter';
import { prisma } from '@master-bot/api/src/db/client';
import { env } from '../../../env/server.mjs';

const perms = [
  'identify',
  'guilds',
  'email',
  'applications.commands.permissions.update'
];

const scope = perms.join(' ');

export const authOptions: NextAuthOptions = {
  // Include user.id on session
  callbacks: {
    session({ session, user }) {
      if (session.user) {
        session.user.id = user.id;
        session.user.discordId = user.discordId;
      }
      return session;
    }
  },
  session: {
    maxAge: 60 * 60 * 24 * 365 // 365 days
  },
  // Configure one or more authentication providers
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
    DiscordProvider({
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
    // ...add more providers here
  ],
  pages: {
    signin: '/auth/signin',
    signout: '/auth/signout'
  }
};

export default NextAuth(authOptions);
