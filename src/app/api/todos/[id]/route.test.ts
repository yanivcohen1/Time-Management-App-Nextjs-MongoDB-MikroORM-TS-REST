import { expect, describe, it, beforeEach, vi } from 'vitest';
import { NextRequest } from 'next/server';
import { PUT, DELETE } from './route';
import { isAuthenticatedApp } from '@/lib/auth';
import { getORM } from '@/lib/db';
import { ObjectId } from '@mikro-orm/mongodb';

vi.mock('@/lib/auth');
vi.mock('@/lib/db', () => ({
  getORM: vi.fn(),
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  handleError: (handler: any) => handler,
}));
vi.mock('@mikro-orm/core', async () => {
  const actual = await vi.importActual<typeof import('@mikro-orm/core')>('@mikro-orm/core');
  return {
    ...actual,
    serialize: vi.fn((obj) => obj),
  };
});
vi.mock('@/entities/Todo', () => ({
  Todo: class {},
  TodoStatus: {
    BACKLOG: 'BACKLOG',
    PENDING: 'PENDING',
    IN_PROGRESS: 'IN_PROGRESS',
    COMPLETED: 'COMPLETED',
  },
}));

describe('/api/todos/[id]', () => {
  const mockFindOne = vi.fn();
  const mockFlush = vi.fn();
  const mockRemoveAndFlush = vi.fn();
  const mockFork = vi.fn(() => ({
    findOne: mockFindOne,
    flush: mockFlush,
    removeAndFlush: mockRemoveAndFlush,
  }));

  const validUserId = '507f1f77bcf86cd799439011';
  const todoId = '507f1f77bcf86cd799439012';

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(getORM).mockResolvedValue({
      em: {
        fork: mockFork,
      } as unknown,
    } as unknown as Awaited<ReturnType<typeof getORM>>);
    vi.mocked(isAuthenticatedApp).mockResolvedValue({ userId: validUserId, role: 'user' });
  });

  it('PUT updates todo for owner', async () => {
    const request = new NextRequest('http://localhost/api/todos/todo-123', {
      method: 'PUT',
      body: JSON.stringify({ title: 'Updated Title' }),
    });

    mockFindOne.mockResolvedValue({ id: todoId, title: 'Old Title' });

    const response = await PUT(request, { params: Promise.resolve({ id: todoId }) });

    expect(response.status).toBe(200);
    expect(mockFindOne).toHaveBeenCalledWith(
      expect.anything(),
      { _id: new ObjectId(todoId), owner: new ObjectId(validUserId) }
    );
    expect(mockFlush).toHaveBeenCalled();
  });

  it('PUT updates todo for admin', async () => {
    vi.mocked(isAuthenticatedApp).mockResolvedValue({ userId: validUserId, role: 'admin' });
    const request = new NextRequest('http://localhost/api/todos/todo-123', {
      method: 'PUT',
      body: JSON.stringify({ title: 'Updated Title' }),
    });

    mockFindOne.mockResolvedValue({ id: todoId, title: 'Old Title' });

    const response = await PUT(request, { params: Promise.resolve({ id: todoId }) });

    expect(response.status).toBe(200);
    expect(mockFindOne).toHaveBeenCalledWith(
      expect.anything(),
      { _id: new ObjectId(todoId) }
    );
    expect(mockFlush).toHaveBeenCalled();
  });

  it('DELETE removes todo for owner', async () => {
    const request = new NextRequest('http://localhost/api/todos/todo-123', {
      method: 'DELETE',
    });

    mockFindOne.mockResolvedValue({ id: todoId, title: 'Old Title' });

    const response = await DELETE(request, { params: Promise.resolve({ id: todoId }) });

    expect(response.status).toBe(200);
    expect(mockFindOne).toHaveBeenCalledWith(
      expect.anything(),
      { _id: new ObjectId(todoId), owner: new ObjectId(validUserId) }
    );
    expect(mockRemoveAndFlush).toHaveBeenCalled();
  });

  it('DELETE removes todo for admin', async () => {
    vi.mocked(isAuthenticatedApp).mockResolvedValue({ userId: validUserId, role: 'admin' });
    const request = new NextRequest('http://localhost/api/todos/todo-123', {
      method: 'DELETE',
    });

    mockFindOne.mockResolvedValue({ id: todoId, title: 'Admin Task' });

    const response = await DELETE(request, { params: Promise.resolve({ id: todoId }) });

    expect(response.status).toBe(200);
    expect(mockFindOne).toHaveBeenCalledWith(
      expect.anything(),
      { _id: new ObjectId(todoId) }
    );
    expect(mockRemoveAndFlush).toHaveBeenCalled();
  });

  it('PUT returns 404 if todo not found', async () => {
    const request = new NextRequest('http://localhost/api/todos/non-existent', {
      method: 'PUT',
      body: JSON.stringify({ title: 'New' }),
    });

    mockFindOne.mockResolvedValue(null);

    await expect(PUT(request, { params: Promise.resolve({ id: '507f1f77bcf86cd799439011' }) })).rejects.toThrow('Todo not found');
  });

  it('DELETE returns 404 if todo not found', async () => {
    const request = new NextRequest('http://localhost/api/todos/non-existent', {
      method: 'DELETE',
    });

    mockFindOne.mockResolvedValue(null);

    await expect(DELETE(request, { params: Promise.resolve({ id: '507f1f77bcf86cd799439011' }) })).rejects.toThrow('Todo not found');
  });
});
