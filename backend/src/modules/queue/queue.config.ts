import { QueueOptions, WorkerOptions } from 'bullmq';
import { RedisOptions } from 'ioredis';

// Redis接続設定
export const getRedisConfig = (): RedisOptions => {
  const redisHost = process.env.REDIS_HOST || 'localhost';
  const redisPort = parseInt(process.env.REDIS_PORT || '6379', 10);
  const redisPassword = process.env.REDIS_PASSWORD;

  return {
    host: redisHost,
    port: redisPort,
    password: redisPassword || undefined,
    maxRetriesPerRequest: null,
  };
};

// Queue共通設定
export const defaultQueueOptions: QueueOptions = {
  connection: getRedisConfig(),
  defaultJobOptions: {
    attempts: 3,
    backoff: {
      type: 'exponential',
      delay: 2000,
    },
    removeOnComplete: {
      count: 100, // 最新100件のみ保持
      age: 24 * 3600, // 24時間
    },
    removeOnFail: {
      count: 50, // 最新50件のみ保持
    },
  },
};

// Worker共通設定
export const defaultWorkerOptions: Omit<WorkerOptions, 'connection'> = {
  autorun: true,
  concurrency: 5,
};
