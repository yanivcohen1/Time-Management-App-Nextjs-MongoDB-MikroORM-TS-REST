import { z } from 'zod';

export const UserRoleSchema = z.enum(['user', 'admin']);

export const UserSchema = z.object({
  id: z.string(),
  name: z.string(),
  email: z.string().email(),
  role: UserRoleSchema,
  createdAt: z.string().or(z.date()),
  updatedAt: z.string().or(z.date()),
});

export const TodoStatusSchema = z.enum(['BACKLOG', 'PENDING', 'IN_PROGRESS', 'COMPLETED']);

export const TodoSchema = z.object({
  id: z.string(),
  title: z.string(),
  description: z.string().optional(),
  status: TodoStatusSchema,
  dueTime: z.string().or(z.date()).optional().nullable(),
  duration: z.number().optional().nullable(),
  owner: UserSchema.omit({ createdAt: true, updatedAt: true }).optional(),
  createdAt: z.string().or(z.date()),
  updatedAt: z.string().or(z.date()),
});

export const LoginResponseSchema = z.object({
  token: z.string(),
  user: UserSchema.omit({ createdAt: true, updatedAt: true }),
});

export const ErrorSchema = z.object({
  message: z.string(),
});

export const PaginatedTodosSchema = z.object({
  items: z.array(TodoSchema),
  total: z.number(),
});
