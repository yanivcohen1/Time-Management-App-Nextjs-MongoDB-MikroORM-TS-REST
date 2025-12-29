import { NextRequest } from 'next/server';
import { getORM } from '@/lib/db';
import { Todo, TodoStatus } from '@/entities/Todo';
import { isAuthenticatedApp } from '@/lib/auth';
import { User } from '@/entities/User';
import { ObjectId } from '@mikro-orm/mongodb';
import { FilterQuery } from '@mikro-orm/core';

async function handlerGET(request: NextRequest) {
  const userPayload = isAuthenticatedApp(request);
  if (!userPayload) return Response.json({ message: 'Unauthorized' }, { status: 401 });

  const orm = await getORM();
  const em = orm.em.fork();

  try {
    const { searchParams } = new URL(request.url);
    const filter: FilterQuery<Todo> = {};
    const userId = searchParams.get('userId');
    const status = searchParams.get('status');
    const title = searchParams.get('title');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    const page = searchParams.get('page');
    const limit = searchParams.get('limit');
    const orderBy = searchParams.get('orderBy');
    const order = searchParams.get('order');

    const pageNum = page ? parseInt(page, 10) : 0;
    const limitNum = limit ? parseInt(limit, 10) : 10;
    const offset = pageNum * limitNum;

    if (userPayload.role === 'admin') {
      if (userId) {
        filter.owner = new ObjectId(userId);
      }
    } else {
      filter.owner = new ObjectId(userPayload.userId);
    }

    if (status && status !== 'ALL') {
      if (Object.values(TodoStatus).includes(status as TodoStatus)) {
        filter.status = status as TodoStatus;
      }
    }

    if (title) {
      filter.title = new RegExp(title, 'i');
    }

    if (startDate || endDate) {
      const dateFilter: { $gte?: Date; $lte?: Date } = {};
      if (startDate) {
        const start = new Date(startDate);
        if (isNaN(start.getTime())) {
          return Response.json({ message: 'Invalid startDate format' }, { status: 400 });
        }
        dateFilter.$gte = start;
      }
      if (endDate) {
        const end = new Date(endDate);
        if (isNaN(end.getTime())) {
          return Response.json({ message: 'Invalid endDate format' }, { status: 400 });
        }
        end.setHours(23, 59, 59, 999);
        dateFilter.$lte = end;
      }
      filter.dueTime = dateFilter;
    }

    const sortOrder = order === 'desc' ? 'DESC' : 'ASC';
    const sortField = orderBy || 'createdAt';

    const [todos, count] = await em.findAndCount(Todo, filter, {
      orderBy: { [sortField]: sortOrder },
      limit: limitNum,
      offset: offset
    });

    return Response.json({ items: todos, total: count });
  } catch (error) {
    console.error('Error fetching todos:', error);
    return Response.json({ message: 'Error fetching todos' }, { status: 500 });
  }
}

async function handlerPOST(request: NextRequest) {
  const userPayload = isAuthenticatedApp(request);
  if (!userPayload) return Response.json({ message: 'Unauthorized' }, { status: 401 });

  const orm = await getORM();
  const em = orm.em.fork();

  const { title, description, dueTime, status, duration } = await request.json();
  if (!title) {
    return Response.json({ message: 'Title is required' }, { status: 400 });
  }

  const user = await em.findOne(User, { _id: new ObjectId(userPayload.userId) });
  if (!user) {
    return Response.json({ message: 'User not found' }, { status: 404 });
  }

  const todo = new Todo(title, user);
  if (description) todo.description = description;
  if (dueTime) {
    const dueDate = new Date(dueTime);
    if (isNaN(dueDate.getTime())) {
      return Response.json({ message: 'Invalid dueTime format' }, { status: 400 });
    }
    todo.dueTime = dueDate;
  }
  if (status) todo.status = status;
  if (duration) todo.duration = duration;

  await em.persistAndFlush(todo);
  return Response.json(todo, { status: 201 });
}

export const GET = handlerGET;
export const POST = handlerPOST;