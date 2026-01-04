import { NextRequest } from 'next/server';
import { getORM, handleError } from '@/lib/db';
import { User } from '@/entities/User';
import { hashPassword } from '@/lib/password';

export async function handlerPOST(request: NextRequest) {
  try {
    const { name, email, password } = await request.json();

    if (!name || !email || !password) {
      return Response.json({ message: 'Name, email, and password are required' }, { status: 400 });
    }

    const orm = await getORM();
    const em = orm.em.fork();

    // Check if user already exists
    const existingUser = await em.findOne(User, { email });
    if (existingUser) {
      return Response.json({ message: 'User already exists' }, { status: 409 });
    }

    const hashedPassword = await hashPassword(password);

    const user = new User(name, email, hashedPassword, 'user');
    await em.persistAndFlush(user);

    return Response.json({ message: 'Registration successful' });
  } catch (error) {
    console.error('Registration error:', error);
    return Response.json({ message: 'Internal server error' }, { status: 500 });
  }
}

export const POST = handleError(handlerPOST);