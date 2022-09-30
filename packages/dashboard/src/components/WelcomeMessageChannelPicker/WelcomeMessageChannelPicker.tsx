import React from 'react';
import { trpc } from '../../utils/trpc';

const WelcomeMessageChannelPicker = ({ guildId }: { guildId: string }) => {
  const { data: channelData, isLoading: isLoadingChannelData } =
    trpc.welcome.getChannel.useQuery({
      guildId
    });

  const [value, setValue] = React.useState(
    channelData?.guild?.welcomeMessageChannel
  );

  const { data, isLoading } = trpc.channel.getAll.useQuery({
    guildId
  });

  const { mutate } = trpc.welcome.setChannel.useMutation();

  return (
    <div className="flex flex-col gap-2">
      <label className="text-xl">Welcome Message Channel</label>
      {isLoading && !data && isLoadingChannelData && !channelData ? (
        <div>Loading channels...</div>
      ) : (
        <div className="flex flex-col gap-3">
          <select
            className="w-56 h-7 outline-none text-black bg-white rounded-sm hover:text-white hover:bg-black hover:cursor-pointer hover:border hover:border-white"
            value={value ? value : ''}
            onChange={e => setValue(e.target.value)}
          >
            {data?.channels.map(channel => (
              <option value={channel.id} key={channel.id}>
                {channel.name}
              </option>
            ))}
          </select>
          <button
            className="w-fit p-1 px-2 rounded-sm text-white bg-blue-800 hover:bg-blue-900"
            type="submit"
            onClick={() => {
              if (!value) return;
              mutate({
                guildId,
                channelId: value
              });
            }}
          >
            Set Channel
          </button>
        </div>
      )}
    </div>
  );
};

export default WelcomeMessageChannelPicker;
