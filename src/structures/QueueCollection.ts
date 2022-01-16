import { Queue } from './Queue';
import Collection from '@discordjs/collection';
import type { ExtendedNode } from './ExtendedNode';

export class QueueCollection extends Collection<string, Queue> {
  public constructor(public readonly client: ExtendedNode) {
    super();
  }

  public get(key: string): Queue {
    let queue = super.get(key);
    if (!queue) {
      queue = new Queue(this, key);
      this.set(key, queue);
    }
    return queue;
  }
}
