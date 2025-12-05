import { NextApiRequest, NextApiResponse } from 'next';
import { withORM, getORM } from '../../../lib/db';
import { seedDatabase } from '../../../lib/seeder';

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const orm = await getORM();
  const em = orm.em.fork();

  await seedDatabase(em);

  res.status(200).json({ message: 'Seeding successful' });
};

export default withORM(handler);
