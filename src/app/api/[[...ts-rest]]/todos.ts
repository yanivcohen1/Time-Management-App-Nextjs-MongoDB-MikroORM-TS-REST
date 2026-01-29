/* eslint-disable @typescript-eslint/no-explicit-any */
import { tsr } from '@ts-rest/serverless/fetch';
import { c } from '@/lib/init-ts-rest';
import { z } from 'zod';
import { 
  TodoSchema, 
  TodoStatusSchema, 
  PaginatedTodosSchema, 
  ErrorSchema 
} from '@/lib/schemas';

// --- Get Todos ---
const getTodos = {
  contract: {
    method: 'GET',
    path: '/todos',
    query: z.object({
      userId: z.string().optional(),
      status: z.string().optional(),
      title: z.string().optional(),
      startDate: z.string().optional(),
      endDate: z.string().optional(),
      page: z.string().optional().transform(v => v ? parseInt(v, 10) : 0),
      limit: z.string().optional().transform(v => v ? parseInt(v, 10) : 10),
      orderBy: z.string().optional(),
      order: z.enum(['asc', 'desc']).optional(),
    }),
    responses: {
      200: PaginatedTodosSchema,
      401: ErrorSchema,
      400: ErrorSchema,
    },
    summary: 'Get all todos with filtering and pagination',
  } as const,
  handler: typeof window === 'undefined' ? (async ({ query }: any) => {
    try {
      const { isAuthenticatedApp } = await import('@/lib/auth');
      const { getORM } = await import('@/lib/db');
      const { Todo, TodoStatus } = await import('@/entities/Todo');
      const { serialize } = await import('@mikro-orm/core');
      const { ObjectId } = await import('@mikro-orm/mongodb');

      const userPayload = await isAuthenticatedApp();
      const orm = await getORM();
      const em = orm.em.fork();
      const { userId, status, title, startDate, endDate, page, limit, orderBy, order } = query;
      const filter: any = {};
      const pageNum = page;
      const limitNum = limit;

      if (userPayload.role === 'admin') {
        if (userId) filter.owner = new ObjectId(userId);
      } else {
        filter.owner = new ObjectId(userPayload.userId);
      }

      if (status && status !== 'ALL') {
        if (Object.values(TodoStatus).includes(status as any)) {
          filter.status = status as any;
        }
      }

      if (title) {
        (filter as any).title = { $regex: title, $options: 'i' };
      }

      if (startDate || endDate) {
        const dateFilter: { $gte?: Date; $lte?: Date } = {};
        if (startDate) dateFilter.$gte = new Date(startDate);
        if (endDate) {
          const end = new Date(endDate);
          end.setHours(23, 59, 59, 999);
          dateFilter.$lte = end;
        }
        filter.dueTime = dateFilter;
      }

      const sortField = (orderBy as string) || 'createdAt';
      const [todos, count] = await em.findAndCount(Todo, filter, {
        orderBy: { [sortField]: order === 'desc' ? 'DESC' : 'ASC' },
        limit: limitNum,
        offset: pageNum * limitNum,
        populate: ['owner']
      });

      return {
        status: 200 as const,
        body: {
          items: todos.map((todo: any) => serialize(todo)) as any,
          total: count,
        },
      };
    } catch (error: any) {
      if (error.status && typeof error.status === 'number') return { status: error.status as any, body: { message: error.message } };
      console.error(error);
      return { status: 500 as const, body: { message: 'Internal Server Error' } };
    }
  }) : (undefined as any),
};

// --- Create Todo ---
const createTodo = {
  contract: {
    method: 'POST',
    path: '/todos',
    body: z.object({
      title: z.string(),
      description: z.string().optional(),
      status: TodoStatusSchema.optional(),
      dueTime: z.string().optional(),
      duration: z.number().optional(),
    }),
    responses: {
      201: TodoSchema,
      401: ErrorSchema,
      400: ErrorSchema,
    },
    summary: 'Create a new todo',
  } as const,
  handler: typeof window === 'undefined' ? (async ({ body }: any) => {
    try {
      const { isAuthenticatedApp } = await import('@/lib/auth');
      const { getORM } = await import('@/lib/db');
      const { Todo } = await import('@/entities/Todo');
      const { User } = await import('@/entities/User');
      const { serialize } = await import('@mikro-orm/core');

      const userPayload = await isAuthenticatedApp();
      const orm = await getORM();
      const em = orm.em.fork();
      const user = await em.findOneOrFail(User, { id: userPayload.userId });
      const todo = new Todo(body.title, user);
      if (body.description) todo.description = body.description;
      if (body.status) todo.status = body.status as any;
      if (body.dueTime) todo.dueTime = new Date(body.dueTime);
      if (body.duration) todo.duration = body.duration;
      await em.persistAndFlush(todo);
      return { status: 201 as const, body: serialize(todo) as any };
    } catch (error: any) {
      if (error.status && typeof error.status === 'number') return { status: error.status as any, body: { message: error.message } };
      console.error(error);
      return { status: 500 as const, body: { message: 'Internal Server Error' } };
    }
  }) : (undefined as any),
};

// --- Get Todo ---
const getTodo = {
  contract: {
    method: 'GET',
    path: '/todos/:id',
    pathParams: z.object({
      id: z.string(),
    }),
    responses: {
      200: TodoSchema,
      404: ErrorSchema,
      401: ErrorSchema,
    },
    summary: 'Get a single todo by ID',
  } as const,
  handler: typeof window === 'undefined' ? (async ({ params }: any) => {
    try {
      const { isAuthenticatedApp } = await import('@/lib/auth');
      const { getORM } = await import('@/lib/db');
      const { Todo } = await import('@/entities/Todo');
      const { serialize } = await import('@mikro-orm/core');
      const { ObjectId } = await import('@mikro-orm/mongodb');

      const userPayload = await isAuthenticatedApp();
      const orm = await getORM();
      const em = orm.em.fork();
      const filter: any = { _id: new ObjectId(params.id) };
      if (userPayload.role !== 'admin') {
        filter.owner = new ObjectId(userPayload.userId);
      }
      const todo = await em.findOne(Todo, filter, { populate: ['owner'] });
      if (!todo) return { status: 404 as const, body: { message: 'Todo not found' } };
      return { status: 200 as const, body: serialize(todo) as any };
    } catch (error: any) {
      if (error.status && typeof error.status === 'number') return { status: error.status as any, body: { message: error.message } };
      console.error(error);
      return { status: 500 as const, body: { message: 'Internal Server Error' } };
    }
  }) : (undefined as any),
};

// --- Update Todo ---
const updateTodo = {
  contract: {
    method: 'PATCH',
    path: '/todos/:id',
    pathParams: z.object({
      id: z.string(),
    }),
    body: z.object({
      title: z.string().optional(),
      description: z.string().optional(),
      status: TodoStatusSchema.optional(),
      dueTime: z.string().optional().nullable(),
      duration: z.number().optional().nullable(),
    }),
    responses: {
      200: TodoSchema,
      404: ErrorSchema,
      401: ErrorSchema,
      400: ErrorSchema,
    },
    summary: 'Update a todo by ID',
  } as const,
  handler: typeof window === 'undefined' ? (async ({ params, body }: any) => {
    try {
      const { isAuthenticatedApp } = await import('@/lib/auth');
      const { getORM } = await import('@/lib/db');
      const { Todo } = await import('@/entities/Todo');
      const { serialize } = await import('@mikro-orm/core');
      const { ObjectId } = await import('@mikro-orm/mongodb');

      const userPayload = await isAuthenticatedApp();
      const orm = await getORM();
      const em = orm.em.fork();
      const filter: any = { _id: new ObjectId(params.id) };
      if (userPayload.role !== 'admin') {
        filter.owner = new ObjectId(userPayload.userId);
      }
      const todo = await em.findOne(Todo, filter);
      if (!todo) return { status: 404 as const, body: { message: 'Todo not found' } };
      if (body.title !== undefined) todo.title = body.title;
      if (body.description !== undefined) todo.description = body.description;
      if (body.status !== undefined) todo.status = body.status as any;
      if (body.dueTime !== undefined) {
        todo.dueTime = body.dueTime ? new Date(body.dueTime) : undefined;
      }
      if (body.duration !== undefined) {
        todo.duration = body.duration ?? undefined;
      }
      await em.flush();
      return { status: 200 as const, body: serialize(todo) as any };
    } catch (error: any) {
      if (error.status && typeof error.status === 'number') return { status: error.status as any, body: { message: error.message } };
      console.error(error);
      return { status: 500 as const, body: { message: 'Internal Server Error' } };
    }
  }) : (undefined as any),
};

// --- Delete Todo ---
const deleteTodo = {
  contract: {
    method: 'DELETE',
    path: '/todos/:id',
    pathParams: z.object({
      id: z.string(),
    }),
    body: z.object({}),
    responses: {
      200: z.object({ message: z.string() }),
      404: ErrorSchema,
      401: ErrorSchema,
    },
    summary: 'Delete a todo by ID',
  } as const,
  handler: typeof window === 'undefined' ? (async ({ params }: any) => {
    try {
      const { isAuthenticatedApp } = await import('@/lib/auth');
      const { getORM } = await import('@/lib/db');
      const { Todo } = await import('@/entities/Todo');
      const { ObjectId } = await import('@mikro-orm/mongodb');

      const userPayload = await isAuthenticatedApp();
      const orm = await getORM();
      const em = orm.em.fork();
      const filter: any = { _id: new ObjectId(params.id) };
      if (userPayload.role !== 'admin') {
        filter.owner = new ObjectId(userPayload.userId);
      }
      const todo = await em.findOne(Todo, filter);
      if (!todo) return { status: 404 as const, body: { message: 'Todo not found' } };
      await em.removeAndFlush(todo);
      return { status: 200 as const, body: { message: 'Todo deleted' } };
    } catch (error: any) {
      if (error.status && typeof error.status === 'number') return { status: error.status as any, body: { message: error.message } };
      console.error(error);
      return { status: 500 as const, body: { message: 'Internal Server Error' } };
    }
  }) : (undefined as any),
};

export const todosContract = c.router({
  getTodos: getTodos.contract,
  createTodo: createTodo.contract,
  getTodo: getTodo.contract,
  updateTodo: updateTodo.contract,
  deleteTodo: deleteTodo.contract,
});

export const getTodosRouter = () => tsr.router(todosContract, {
  getTodos: getTodos.handler,
  createTodo: createTodo.handler,
  getTodo: getTodo.handler,
  updateTodo: updateTodo.handler,
  deleteTodo: deleteTodo.handler,
});
