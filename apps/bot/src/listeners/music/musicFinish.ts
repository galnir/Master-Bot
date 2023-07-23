import { ApplyOptions } from '@sapphire/decorators';
import { Listener, type ListenerOptions, container } from '@sapphire/framework';
import { deletePlayerEmbed } from '../../lib/music/buttonsCollector';
import type { Queue } from '../../lib/music/classes/Queue';
// import { inactivityTime } from '../../lib/music/handleOptions';

@ApplyOptions<ListenerOptions>({
	name: 'musicFinish'
})
export class MusicFinishListener extends Listener {
	public override async run(
		queue: Queue,
		skipped: boolean = false
	): Promise<void> {
		const channel = await queue.getTextChannel();
		const { client } = container;
		await deletePlayerEmbed(queue);
		if (skipped) return;
		client.leaveTimers[queue.player.guildId] = setTimeout(async () => {
			if (channel) queue.client.emit('musicFinishNotify', channel);
			await queue.leave();
			// }, inactivityTime());
		}, 30000);
	}
}
