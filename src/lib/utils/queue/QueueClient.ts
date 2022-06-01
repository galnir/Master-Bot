import Redis from 'ioredis';
import type { RedisOptions } from 'ioredis';
import { NodeOptions, Node } from 'lavaclient';
import { QueueStore } from './QueueStore';

export interface QueueClientOptions extends NodeOptions {
  redis: Redis | RedisOptions;
}

export class QueueClient extends Node {
  public readonly queues: QueueStore;

  public constructor(options: QueueClientOptions) {
    super(options);
    this.queues = new QueueStore(
      this,
      options.redis instanceof Redis ? options.redis : new Redis(options.redis)
    );
  }
}
