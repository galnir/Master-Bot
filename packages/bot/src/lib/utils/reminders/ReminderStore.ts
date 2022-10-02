import Redis, { RedisKey, RedisValue } from 'ioredis';

export default class ReminderStore {
  redis: Redis;
  constructor() {
    this.redis = new Redis({
      host: process.env.REDIS_HOST || 'localhost',
      port: Number.parseInt(process.env.REDIS_PORT!) || 6379,
      password: process.env.REDIS_PASSWORD || '',
      db: Number.parseInt(process.env.REDIS_DB!) || 0
    });
    this.redis.on('ready', () => {
      this.redis.config('SET', 'notify-keyspace-events', 'Ex');
    });
  }
  get(key: RedisKey) {
    return this.redis.get(key);
  }
  getKeys(key: RedisKey) {
    return this.redis.keys(`reminders.${key}*`);
  }
  getUsersReminders(keys: RedisKey[]) {
    return this.redis.mget(keys);
  }
  delete(key: RedisKey) {
    return this.redis.del(key);
  }
  setReminder(
    userId: string,
    event: string,
    value: RedisValue,
    expire: string
  ) {
    event = event.replace(/\./g, '');
    const delay = 60; // add extra time to data
    return (
      this.redis
        .multi()
        // Save a key for TTL (dummy data)
        .set(`reminders.${userId}.${event}.trigger`, 1)
        .expireat(
          `reminders.${userId}.${event}.trigger`,
          Date.parse(expire) / 1000
        )
        // Cache actual data
        .set(`reminders.${userId}.${event}`, value)
        .expireat(
          `reminders.${userId}.${event}`,
          Date.parse(expire) / 1000 + delay
        )
        .exec()
    );
  }
}
