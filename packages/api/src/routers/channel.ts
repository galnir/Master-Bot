import { createRouter } from "../createRouter";
import { z } from "zod";
import { APIGuildChannel, APIGuildTextChannel } from "discord-api-types/v10";

export const channelRouter = createRouter().query("get-all", {
  input: z.object({
    guildId: z.string(),
  }),
  async resolve({ input }) {
    const { guildId } = input;

    const token = process.env.DISCORD_TOKEN;

    // call the discord api with the token and the guildId and get all the guild's text channels
    const response = await fetch(
      `https://discordapp.com/api/guilds/${guildId}/channels`,
      {
        headers: {
          Authorization: `Bot ${token}`,
        },
      }
    );
    const responseChannels: APIGuildChannel<any>[] = await response.json();

    const channels: APIGuildTextChannel<2>[] = responseChannels.filter(
      (channel) => channel.type === 2
    );
    return { channels };
  },
});
