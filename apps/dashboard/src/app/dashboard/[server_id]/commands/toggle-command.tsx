'use client';

import { Switch } from '~/components/ui/switch';
import { startTransition } from 'react';
import { toggleCommand } from './actions';
import { useToast } from '~/components/ui/use-toast';
import { ToastAction } from '~/components/ui/toast';

export default function CommandToggleSwitch({
	commandEnabled,
	serverId,
	commandId
}: {
	commandEnabled: boolean;
	serverId: string;
	commandId: string;
}) {
	const { toast } = useToast();

	return (
		<Switch
			checked={commandEnabled}
			onCheckedChange={() =>
				startTransition(() =>
					// @ts-ignore
					toggleCommand(serverId, commandId, !commandEnabled).then(() => {
						toast({
							title: `Command ${commandEnabled ? 'disabled' : 'enabled'}`,
							action: <ToastAction altText="Okay">Okay</ToastAction>
						});
					})
				)
			}
		/>
	);
}
