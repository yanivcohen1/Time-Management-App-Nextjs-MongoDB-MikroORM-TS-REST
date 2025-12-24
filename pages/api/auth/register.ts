import { NextApiRequest, NextApiResponse } from 'next';
import { withORM, getORM } from '../../../lib/db';
import { User } from '../../../entities/User';
import { hashPassword } from '../../../lib/password';

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({ message: 'Name, email, and password are required' });
  }

  const orm = await getORM();
  const em = orm.em.fork();

  const existingUser = await em.findOne(User, { email });
  if (existingUser) {
    return res.status(409).json({ message: 'User already exists' });
  }

  const hashedPassword = await hashPassword(password);
  const user = new User(name, email, hashedPassword, 'user');

  await em.persistAndFlush(user);

  res.status(201).json({ message: 'User created successfully' });
};

export default withORM(handler);