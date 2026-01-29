/* eslint-disable @typescript-eslint/no-explicit-any */
import { tsr } from '@ts-rest/serverless/fetch';
import { c } from '@/lib/init-ts-rest';
import { z } from 'zod';
import { UserSchema, ErrorSchema } from '@/lib/schemas';

// --- Get Users ---
const getUsers = {
  contract: {
    method: 'GET',
    path: '/users',
    responses: {
      200: z.array(UserSchema),
      401: ErrorSchema,
      403: ErrorSchema,
    },
    summary: 'Get all users (Admin only)',
  } as const,
  handler: typeof window === 'undefined' ? (async () => {
    try {
      const { isAuthenticatedApp } = await import('@/lib/auth');
      const { getORM } = await import('@/lib/db');
      const { User } = await import('@/entities/User');
      const { serialize } = await import('@mikro-orm/core');

      const userPayload = await isAuthenticatedApp();
      if (userPayload.role !== 'admin') return { status: 403 as const, body: { message: 'Forbidden' } };

      const orm = await getORM();
      const em = orm.em.fork();

      const users = await em.find(User, {}, { fields: ['id', 'name', 'email', 'role', 'createdAt', 'updatedAt'] });
      return { status: 200 as const, body: users.map((u: any) => serialize(u)) as any };
    } catch (error: any) {
      if (error.status && typeof error.status === 'number') return { status: error.status as any, body: { message: error.message } };
      console.error(error);
      return { status: 500 as const, body: { message: 'Internal Server Error' } };
    }
  }) : (undefined as any),
};

// --- Get Me ---
const getMe = {
  contract: {
    method: 'GET',
    path: '/users/me',
    responses: {
      200: UserSchema,
      401: ErrorSchema,
    },
    summary: 'Get current user profile',
  } as const,
  handler: typeof window === 'undefined' ? (async () => {
    try {
      const { isAuthenticatedApp } = await import('@/lib/auth');
      const { getORM } = await import('@/lib/db');
      const { User } = await import('@/entities/User');
      const { serialize } = await import('@mikro-orm/core');

      const userPayload = await isAuthenticatedApp();
      const orm = await getORM();
      const em = orm.em.fork();
      const user = await em.findOne(User, { id: userPayload.userId });
      if (!user) return { status: 401 as const, body: { message: 'User not found' } };
      return { status: 200 as const, body: serialize(user) as any };
    } catch (error: any) {
      if (error.status && typeof error.status === 'number') return { status: error.status as any, body: { message: error.message } };
      console.error(error);
      return { status: 500 as const, body: { message: 'Internal Server Error' } };
    }
  }) : (undefined as any),
};

export const usersContract = c.router({
  getUsers: getUsers.contract,
  getMe: getMe.contract,
});

export const getUsersRouter = () => tsr.router(usersContract, {
  getUsers: getUsers.handler,
  getMe: getMe.handler,
});
