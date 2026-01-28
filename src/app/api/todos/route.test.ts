import { expect, describe, it, beforeEach, vi } from 'vitest';
import { NextRequest } from 'next/server';
import { GET, POST } from './route';
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
vi.mock('@/entities/User', () => ({
  User: class {},
}));

describe('/api/todos', () => {
  const mockFind = vi.fn();
  const mockFindAndCount = vi.fn();
  const mockFindOne = vi.fn();
  const mockPersistAndFlush = vi.fn();
  const mockFork = vi.fn(() => ({
    find: mockFind,
    findAndCount: mockFindAndCount,
    findOne: mockFindOne,
    persistAndFlush: mockPersistAndFlush,
  }));

  const validUserId = '507f1f77bcf86cd799439011';

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(getORM).mockResolvedValue({
      em: {
        fork: mockFork,
      } as unknown,
    } as unknown as Awaited<ReturnType<typeof getORM>>);
    vi.mocked(isAuthenticatedApp).mockResolvedValue({ userId: validUserId, role: 'user' });
  });

  it('GET returns todos', async () => {
    const request = new NextRequest('http://localhost/api/todos', { method: 'GET' });

    mockFindAndCount.mockResolvedValue([[{ id: '1', title: 'Test Todo' }], 1]);

    const response = await GET(request);

    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({ items: [{ id: '1', title: 'Test Todo' }], total: 1 });
    
    // Verify it was called with ObjectId
    expect(mockFindAndCount).toHaveBeenCalledWith(
      expect.anything(), 
      { owner: expect.any(ObjectId) }, 
      expect.objectContaining({ orderBy: { createdAt: 'ASC' }, limit: 10, offset: 0 })
    );
  });

  it('POST creates a todo', async () => {
    const request = new NextRequest('http://localhost/api/todos', {
      method: 'POST',
      body: JSON.stringify({
        title: 'New Todo',
        description: 'Desc',
        status: 'BACKLOG',
      }),
    });

    mockFindOne.mockResolvedValue({ id: validUserId }); // Mock User found

    const response = await POST(request);

    expect(response.status).toBe(201);
    expect(mockPersistAndFlush).toHaveBeenCalled();
  });

  it('returns 401 if not authenticated', async () => {
    vi.mocked(isAuthenticatedApp).mockRejectedValue(new Error('Unauthorized'));

    const request = new NextRequest('http://localhost/api/todos', { method: 'GET' });

    await expect(GET(request)).rejects.toThrow('Unauthorized');
  });

  it('GET returns all todos for admin', async () => {
    vi.mocked(isAuthenticatedApp).mockResolvedValue({ userId: validUserId, role: 'admin' });
    const request = new NextRequest('http://localhost/api/todos', { method: 'GET' });

    mockFindAndCount.mockResolvedValue([[{ id: '1', title: 'Test Todo' }], 1]);

    const response = await GET(request);

    expect(response.status).toBe(200);
    expect(mockFindAndCount).toHaveBeenCalledWith(
      expect.anything(), 
      {}, 
      expect.objectContaining({ orderBy: { createdAt: 'ASC' }, limit: 10, offset: 0 })
    );
  });

  it('GET filters by status', async () => {
    const request = new NextRequest('http://localhost/api/todos?status=IN_PROGRESS', { method: 'GET' });
    mockFindAndCount.mockResolvedValue([[], 0]);

    await GET(request);

    expect(mockFindAndCount).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({ status: 'IN_PROGRESS' }),
      expect.anything()
    );
  });

  it('GET filters by title regex', async () => {
    const request = new NextRequest('http://localhost/api/todos?title=work', { method: 'GET' });
    mockFindAndCount.mockResolvedValue([[], 0]);

    await GET(request);

    expect(mockFindAndCount).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({ title: { $regex: 'work', $options: 'i' } }),
      expect.anything()
    );
  });

  it('GET filters by date range', async () => {
    const request = new NextRequest('http://localhost/api/todos?startDate=2025-01-01&endDate=2025-12-31', { method: 'GET' });
    mockFindAndCount.mockResolvedValue([[], 0]);

    await GET(request);

    expect(mockFindAndCount).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({
        dueTime: {
          $gte: expect.any(Date),
          $lte: expect.any(Date)
        }
      }),
      expect.anything()
    );
  });

  it('GET sorts correctly', async () => {
    const request = new NextRequest('http://localhost/api/todos?orderBy=title&order=desc', { method: 'GET' });
    mockFindAndCount.mockResolvedValue([[], 0]);

    await GET(request);

    expect(mockFindAndCount).toHaveBeenCalledWith(
      expect.anything(),
      expect.anything(),
      expect.objectContaining({ orderBy: { title: 'DESC' } })
    );
  });

  it('POST rejects missing title', async () => {
    const request = new NextRequest('http://localhost/api/todos', {
      method: 'POST',
      body: JSON.stringify({ description: 'No title' }),
    });

    await expect(POST(request)).rejects.toThrow('Title is required');
  });

  it('POST rejects invalid dueTime', async () => {
    const request = new NextRequest('http://localhost/api/todos', {
      method: 'POST',
      body: JSON.stringify({ title: 'Task', dueTime: 'invalid-date' }),
    });

    mockFindOne.mockResolvedValue({ id: validUserId });

    await expect(POST(request)).rejects.toThrow('Invalid dueTime format');
  });
});
