import { Node, NodeOptions } from 'lavaclient';
import { QueueCollection } from './QueueCollection';

export class ExtendedNode extends Node {
  public readonly queues: QueueCollection;

  public constructor(options: NodeOptions) {
    super(options);
    this.queues = new QueueCollection(this);
  }
}
