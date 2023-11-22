import type { ComponentProps } from 'react';
import type { OAuthProviders } from '@master-bot/auth';

export function SignIn({
	provider,
	...props
}: { provider: OAuthProviders } & ComponentProps<'button'>) {
	return (
		<form action={`/api/auth/signin/${provider}`} method="post">
			<button {...props} />
		</form>
	);
}

export function SignOut(props: ComponentProps<'button'>) {
	return (
		<form action="/api/auth/signout" method="post">
			<button {...props} />
		</form>
	);
}
