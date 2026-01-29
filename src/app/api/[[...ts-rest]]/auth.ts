/* eslint-disable @typescript-eslint/no-explicit-any */
import { tsr } from '@ts-rest/serverless/fetch';
import { c } from '@/lib/init-ts-rest';
import { z } from 'zod';
import { ErrorSchema } from './common';
import { UserSchema } from './users';

export const LoginResponseSchema = z.object({
  token: z.string(),
  user: UserSchema.omit({ createdAt: true, updatedAt: true }),
});

// --- Login ---
const login = {
  contract: {
    method: 'POST',
    path: '/auth/login',
    body: z.object({
      email: z.string().email(),
      password: z.string(),
    }),
    responses: {
      200: LoginResponseSchema,
      401: ErrorSchema,
      400: ErrorSchema,
      500: ErrorSchema,
    },
    summary: 'Login to the application',
  } as const,
  handler: typeof window === 'undefined' ? (async ({ body }: any) => {
    try {
      const { getORM } = await import('@/lib/db');
      const { User } = await import('@/entities/User');
      const { signToken } = await import('@/lib/auth');
      const { comparePassword } = await import('@/lib/password');

      const { email, password } = body;
      const orm = await getORM();
      const em = orm.em.fork();

      const user = await em.findOne(User, { email });
      if (!user) {
        return { status: 401 as const, body: { message: 'Invalid credentials' } };
      }

      const isValidPassword = await comparePassword(password, user.password);
      if (!isValidPassword) {
        return { status: 401 as const, body: { message: 'Invalid credentials' } };
      }

      const token = signToken({ userId: user.id, role: user.role });

      return {
        status: 200 as const,
        body: {
          token,
          user: {
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role,
          },
        },
      };
    } catch (error) {
      console.error(error);
      return { status: 500 as const, body: { message: 'Internal Server Error' } };
    }
  }) : (undefined as any),
};

// --- Register ---
const register = {
  contract: {
    method: 'POST',
    path: '/auth/register',
    body: z.object({
      name: z.string(),
      email: z.string().email(),
      password: z.string(),
    }),
    responses: {
      201: z.object({ message: z.string() }),
      400: ErrorSchema,
      500: ErrorSchema,
    },
    summary: 'Register a new user',
  } as const,
  handler: typeof window === 'undefined' ? (async ({ body }: any) => {
    try {
      const { getORM } = await import('@/lib/db');
      const { User } = await import('@/entities/User');
      const { hashPassword } = await import('@/lib/password');

      const { name, email, password } = body;
      const orm = await getORM();
      const em = orm.em.fork();

      const existingUser = await em.findOne(User, { email });
      if (existingUser) {
        return { status: 400 as const, body: { message: 'User already exists' } };
      }

      const hashedPassword = await hashPassword(password);
      const user = new User(name, email, hashedPassword);
      await em.persistAndFlush(user);

      return { status: 201 as const, body: { message: 'User created' } };
    } catch (error) {
      console.error(error);
      return { status: 500 as const, body: { message: 'Internal Server Error' } };
    }
  }) : (undefined as any),
};

// --- Seed ---
const seed = {
  contract: {
    method: 'POST',
    path: '/auth/seed',
    body: z.object({}),
    responses: {
      200: z.object({ message: z.string() }),
      500: ErrorSchema,
    },
    summary: 'Seed the database (Dev only)',
  } as const,
  handler: typeof window === 'undefined' ? (async () => {
    try {
      const { getORM } = await import('@/lib/db');
      const { seedDatabase } = await import('@/lib/seeder');

      const orm = await getORM();
      const em = orm.em.fork();
      await seedDatabase(em);
      return { status: 200 as const, body: { message: 'Database seeded' } };
    } catch (error) {
      console.error(error);
      return { status: 500 as const, body: { message: 'Internal Server Error' } };
    }
  }) : (undefined as any),
};

export const authContract = c.router({
  login: login.contract,
  register: register.contract,
  seed: seed.contract,
});

export const getAuthRouter = () => tsr.router(authContract, {
  login: login.handler,
  register: register.handler,
  seed: seed.handler,
});
