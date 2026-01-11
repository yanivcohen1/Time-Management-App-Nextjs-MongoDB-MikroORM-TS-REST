import 'dotenv/config';
import { MikroORM } from '@mikro-orm/core';
import { MongoDriver } from '@mikro-orm/mongodb';
import config from '../mikro-orm.config';
import { seedDatabase } from '../src/lib/seeder';
import path from 'path';
import dotenv from 'dotenv';

// Load env vars manually since we are not in Next.js context
const envFile = process.env.NODE_ENV === 'production' ? '.env.production' : '.env.development';
dotenv.config({ path: path.resolve(process.cwd(), envFile) });

// Update config clientUrl if it was undefined when config was imported
if (process.env.DATABASE_URL) {
    config.clientUrl = process.env.DATABASE_URL;
}

const main = async () => {
  console.log(`Connecting to database... (${process.env.DATABASE_URL})`);
  const orm = await MikroORM.init<MongoDriver>(config);
  const em = orm.em.fork();

  console.log('Seeding database...');
  try {
    await seedDatabase(em);
    console.log('Seeding complete!');
  } catch (error) {
    console.error('Seeding failed:', error);
    process.exit(1);
  } finally {
    await orm.close();
  }
};

main();
