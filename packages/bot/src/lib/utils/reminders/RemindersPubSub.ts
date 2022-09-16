import Redis from 'ioredis';

const subscriber = new Redis({
  host: process.env.REDIS_HOST || 'localhost',
  port: Number.parseInt(process.env.REDIS_PORT!) || 6379,
  password: process.env.REDIS_PASSWORD || '',
  db: Number.parseInt(process.env.REDIS_DB!) || 0
});

const publisher = new Redis({
  host: process.env.REDIS_HOST || 'localhost',
  port: Number.parseInt(process.env.REDIS_PORT!) || 6379,
  password: process.env.REDIS_PASSWORD || '',
  db: Number.parseInt(process.env.REDIS_DB!) || 0
});
export default new (class PubSub {
  publish(channel: string, message: string) {
    publisher.publish(channel, message);
  }
  subscribe(channel: string) {
    subscriber.subscribe(channel);
  }
  on(event: string, callback: any) {
    subscriber.on(event, (channel, message) => {
      callback(channel, message);
    });
  }
})();
