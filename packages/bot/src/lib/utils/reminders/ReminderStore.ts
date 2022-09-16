import Redis from 'ioredis';

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
  get(key: string) {
    return this.redis.get(key);
  }
  getKeys(key: string) {
    return this.redis.keys(`${key}*`);
  }
  getUsersReminders(keys: string[]) {
    return this.redis.mget(keys);
  }

  delete(key: string) {
    return this.redis.del(key);
  }
  setReminder(user: string, event: string, value: string, expire: string) {
    console.log(user, event, value, expire);
    return (
      this.redis
        .multi()
        // Save a key for TTL dummy data
        .set(`${user}:reminders:${event}:trigger`, 1)
        .expireat(
          `${user}:reminders:${event}:trigger`,
          Date.parse(expire) / 1000
        )
        // Store actual data (discordId+event)
        .set(`${user}:reminders:${event}`, value)
        .exec()
    );
  }
}
