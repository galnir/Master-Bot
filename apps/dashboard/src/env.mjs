import { createEnv } from '@t3-oss/env-nextjs';
import { z } from 'zod';

export const env = createEnv({
	/**
	 * Specify your server-side environment variables schema here. This way you can ensure the app isn't
	 * built with invalid env vars.
	 */
	server: {
		DATABASE_URL: z.string().url(),
		DISCORD_TOKEN: z.string(),
		DISCORD_CLIENT_ID: z.string()
	},
	/**
	 * Specify your client-side environment variables schema here.
	 * For them to be exposed to the client, prefix them with `NEXT_PUBLIC_`.
	 */
	client: {
		NEXT_PUBLIC_INVITE_URL: z.string().url()
	},
	/**
	 * Destructure all variables from `process.env` to make sure they aren't tree-shaken away.
	 */
	runtimeEnv: {
		DATABASE_URL: process.env.DATABASE_URL,
		DISCORD_TOKEN: process.env.DISCORD_TOKEN,
		DISCORD_CLIENT_ID: process.env.DISCORD_CLIENT_ID,
		NEXT_PUBLIC_INVITE_URL: process.env.NEXT_PUBLIC_INVITE_URL
	},
	skipValidation: !!process.env.CI || !!process.env.SKIP_ENV_VALIDATION
});
