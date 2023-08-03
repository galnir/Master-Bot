'use client';

import { Switch } from '~/components/ui/switch';
import { startTransition } from 'react';
import { toggleWelcomeMessage } from './actions';

export default function ToggleSwitch({
	welcomeMessageEnabled,
	serverId
}: {
	welcomeMessageEnabled: boolean;
	serverId: string;
}) {
	return (
		<Switch
			checked={welcomeMessageEnabled}
			onCheckedChange={() =>
				startTransition(() =>
					// @ts-ignore
					toggleWelcomeMessage(!welcomeMessageEnabled, serverId)
				)
			}
		/>
	);
}
