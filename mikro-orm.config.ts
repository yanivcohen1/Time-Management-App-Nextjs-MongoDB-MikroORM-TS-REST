import 'reflect-metadata';
import { defineConfig } from '@mikro-orm/mongodb';
import { User } from './src/entities/User';
import { Todo } from './src/entities/Todo';
import { ReflectMetadataProvider } from '@mikro-orm/core';

export default defineConfig({
  entities: [User, Todo],
  dbName: 'next-todo-app',
  clientUrl: process.env.DATABASE_URL,
  metadataProvider: ReflectMetadataProvider,
  debug: process.env.NODE_ENV !== 'production',
  migrations: {
    path: './migrations',
    pathTs: './migrations',
  },
});
