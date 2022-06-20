import { useFetcher } from "@remix-run/react";
import { Menu, MenuList, MenuItem, MenuButton } from "@reach/menu-button";
import type { TextChannel } from "discord.js";
import React from "react";

const WelcomeMessageChannelDropDown = ({
  id,
  channels,
  welcome_channel,
}: {
  id: string;
  channels: TextChannel[];
  welcome_channel: string | null;
}) => {
  const fetcher = useFetcher();

  const channelObject = channels.find(
    (channel) => channel.id === welcome_channel
  );

  const [pickedChannel, setPickedChannel] = React.useState(
    channelObject
      ? channelObject.name
      : "Select where to display the welcome message"
  );

  return (
    <Menu className="relative z-10 text-white">
      <MenuButton>{pickedChannel}</MenuButton>
      <MenuList className="text-white">
        {channels.map((channel) => (
          <MenuItem
            className="block"
            key={channel.id}
            onSelect={() => {
              fetcher.submit(
                {
                  channelID: channel.id,
                },
                { method: "post", action: `/dashboard/${id}/welcome` }
              );
              setPickedChannel(channel.name);
            }}
          >
            {channel.name}
          </MenuItem>
        ))}
      </MenuList>
    </Menu>
  );
};

export default WelcomeMessageChannelDropDown;
