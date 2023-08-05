'use client';

import { Switch } from '~/components/ui/switch';
import { startTransition } from 'react';
import { toggleWelcomeMessage } from './actions';
import { useToast } from '~/components/ui/use-toast';
import { ToastAction } from '~/components/ui/toast';

export default function ToggleSwitch({
	welcomeMessageEnabled,
	serverId
}: {
	welcomeMessageEnabled: boolean;
	serverId: string;
}) {
	const { toast } = useToast();

	return (
		<Switch
			checked={welcomeMessageEnabled}
			onCheckedChange={() =>
				startTransition(() =>
					// @ts-ignore
					toggleWelcomeMessage(!welcomeMessageEnabled, serverId).then(() => {
						toast({
							title: `Welcome message ${
								welcomeMessageEnabled ? 'disabled' : 'enabled'
							}`,
							action: <ToastAction altText="Okay">Okay</ToastAction>
						});
					})
				)
			}
		/>
	);
}
