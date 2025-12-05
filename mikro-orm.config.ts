import 'reflect-metadata';
import { defineConfig } from '@mikro-orm/mongodb';
import { User } from './entities/User';
import { Todo } from './entities/Todo';
import { ReflectMetadataProvider } from '@mikro-orm/core';

export default defineConfig({
  entities: [User, Todo],
  dbName: 'next-todo-app',
  clientUrl: process.env.DATABASE_URL,
  metadataProvider: ReflectMetadataProvider,
  debug: process.env.NODE_ENV !== 'production',
});
