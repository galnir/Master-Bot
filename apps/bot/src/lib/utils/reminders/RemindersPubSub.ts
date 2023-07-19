import Redis from 'ioredis';

const options = {
  host: process.env.REDIS_HOST || 'localhost',
  port: Number.parseInt(process.env.REDIS_PORT!) || 6379,
  password: process.env.REDIS_PASSWORD || '',
  db: Number.parseInt(process.env.REDIS_DB!) || 0
};

const pubSub = new Redis(options);

class PubSub {
  publish(channel: string, message: string) {
    pubSub.publish(channel, message);
  }
  subscribe(channel: string) {
    pubSub.subscribe(channel);
  }
  on(event: string, callback: Function) {
    pubSub.on(event, (channel, message) => {
      callback(channel, message);
    });
  }
}

const instance = new PubSub();

export default instance;
