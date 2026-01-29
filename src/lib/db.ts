import type { MikroORM } from '@mikro-orm/core';
import type { MongoDriver } from '@mikro-orm/mongodb';
import config from '../../mikro-orm.config';
import { handleApiError } from "@/lib/http";

// Global cache to prevent multiple connections in dev
const globalForORM = global as unknown as { orm: any }; // eslint-disable-line @typescript-eslint/no-explicit-any

export const getORM = async (): Promise<MikroORM<MongoDriver>> => {
  if (typeof window !== 'undefined') {
    throw new Error('getORM should only be called on the server');
  }
  if (!globalForORM.orm) {
    const coreLib = '@mikro-orm/core';
    const mongoLib = '@mikro-orm/mongodb';
    const core = await import(coreLib);
    await import(mongoLib); 
    globalForORM.orm = await (core.MikroORM as any).init(config as any); // eslint-disable-line @typescript-eslint/no-explicit-any
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

export type EntityManager = any; // eslint-disable-line @typescript-eslint/no-explicit-any
