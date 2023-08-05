'use client';
import { api } from '~/utils/api';
import { useState } from 'react';
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue
} from '~/components/ui/select';
import { Button } from '~/components/ui/button';
import { useToast } from '~/components/ui/use-toast';

export default function WelcomeMessageChannelSet({
	guildId
}: {
	guildId: string;
}) {
	const { toast } = useToast();

	const { data: channelData, isLoading: isLoadingChannelData } =
		api.welcome.getChannel.useQuery(
			{
				guildId
			},
			{
				refetchOnReconnect: false,
				retryOnMount: false,
				refetchOnWindowFocus: false
			}
		);

	const [value, setValue] = useState(channelData?.guild?.welcomeMessageChannel);

	const { data, isLoading } = api.channel.getAll.useQuery({
		guildId
	});

	const { mutate } = api.welcome.setChannel.useMutation();

	return (
		<div className="flex flex-col gap-2">
			<p className="text-xl">Welcome Message Channel</p>
			{isLoading && !data && isLoadingChannelData && !channelData ? (
				<div>Loading channels...</div>
			) : (
				<div>
					<Select
						onValueChange={setValue}
						defaultValue={channelData?.guild?.welcomeMessageChannel ?? ''}
					>
						<SelectTrigger className="w-44">
							<SelectValue placeholder="Select a channel" />
						</SelectTrigger>
						<SelectContent>
							{data?.channels.map(channel => (
								<SelectItem key={channel.id} value={channel.id}>
									{channel.name}
								</SelectItem>
							))}
						</SelectContent>
					</Select>
					<Button
						className="mt-2"
						type="button"
						onClick={() => {
							if (!value) return;
							mutate(
								{
									guildId,
									channelId: value
								},
								{
									onSuccess: () => {
										toast({
											title: 'Welcome message channel set'
										});
									},
									onError: () => {
										toast({
											title: 'Error setting welcome message channel',
											description: 'Please try again later'
										});
									}
								}
							);
						}}
					>
						Set Channel
					</Button>
				</div>
			)}
		</div>
	);
}
