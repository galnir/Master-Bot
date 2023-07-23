import { createEnv } from '@t3-oss/env-core';
import { z } from 'zod';

export const env = createEnv({
	/*
	 * Specify what prefix the client-side variables must have.
	 * This is enforced both on type-level and at runtime.
	 */
	clientPrefix: 'PUBLIC_',
	server: {
		DISCORD_TOKEN: z.string(),
		TENOR_API: z.string(),
		RAWG_API: z.string().optional()
	},
	client: {},
	/**
	 * What object holds the environment variables at runtime.
	 * Often `process.env` or `import.meta.env`
	 */
	runtimeEnv: process.env
});
