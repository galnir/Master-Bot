import Redis from 'ioredis';
import type { RedisOptions } from 'ioredis';
import { ConnectionInfo, Node, SendGatewayPayload } from 'lavaclient';
import { QueueStore } from './QueueStore';

export interface QueueClientOptions {
  redis: Redis | RedisOptions;
}

export interface ConstructorTypes {
  options: QueueClientOptions;
  sendGatewayPayload: SendGatewayPayload;
  connection: ConnectionInfo;
}

export class QueueClient extends Node {
  public readonly queues: QueueStore;

  public constructor({
    options,
    sendGatewayPayload,
    connection
  }: ConstructorTypes) {
    super({ ...options, sendGatewayPayload, connection });
    this.queues = new QueueStore(
      this,
      options.redis instanceof Redis ? options.redis : new Redis(options.redis)
    );
  }
}
