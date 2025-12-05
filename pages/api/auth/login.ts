import { NextApiRequest, NextApiResponse } from 'next';
import { withORM, getORM } from '../../../lib/db';
import { User } from '../../../entities/User';
import { comparePassword } from '../../../lib/password';
import { signToken } from '../../../lib/auth';

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: 'Email and password are required' });
  }

  const orm = await getORM();
  const em = orm.em.fork();

  const user = await em.findOne(User, { email });

  if (!user) {
    return res.status(401).json({ message: 'Invalid credentials' });
  }

  const isValid = await comparePassword(password, user.password);

  if (!isValid) {
    return res.status(401).json({ message: 'Invalid credentials' });
  }

  const token = signToken({ userId: user.id, role: user.role });

  res.status(200).json({ 
    token, 
    user: { 
      id: user.id, 
      name: user.name, 
      email: user.email, 
      role: user.role 
    } 
  });
};

export default withORM(handler);
