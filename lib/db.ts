import { MikroORM } from '@mikro-orm/core';
import { MongoDriver, MongoEntityManager } from '@mikro-orm/mongodb';
import config from '../mikro-orm.config';
import { handleApiError } from "@/lib/http";

// Global cache to prevent multiple connections in dev
const globalForORM = global as unknown as { orm: MikroORM<MongoDriver> };

export const getORM = async () => {
  if (!globalForORM.orm) {
    globalForORM.orm = await MikroORM.init<MongoDriver>(config);
  }
  return globalForORM.orm;
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const handleError = (handler: (...args: any[]) => any) => async (...args: any[]) => {
    try {
      return await handler(...args);
    } catch (error) {
      return await handleApiError(error);
    }
};

export type EntityManager = MongoEntityManager;
