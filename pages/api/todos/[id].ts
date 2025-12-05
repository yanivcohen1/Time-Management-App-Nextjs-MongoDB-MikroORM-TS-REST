import { NextApiRequest, NextApiResponse } from 'next';
import { withORM, getORM } from '../../../lib/db';
import { Todo } from '../../../entities/Todo';
import { isAuthenticated } from '../../../lib/auth';

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  const userPayload = isAuthenticated(req, res);
  if (!userPayload) return;

  const { id } = req.query;
  const orm = await getORM();
  const em = orm.em.fork();

  const todo = await em.findOne(Todo, { id: id as string, owner: userPayload.userId });

  if (!todo) {
    return res.status(404).json({ message: 'Todo not found' });
  }

  if (req.method === 'PUT') {
    const { title, description, status, dueTime } = req.body;
    
    if (title !== undefined) todo.title = title;
    if (description !== undefined) todo.description = description;
    if (status !== undefined) todo.status = status;
    if (dueTime !== undefined) todo.dueTime = dueTime ? new Date(dueTime) : undefined;

    await em.flush();
    return res.status(200).json(todo);
  }

  if (req.method === 'DELETE') {
    await em.removeAndFlush(todo);
    return res.status(200).json({ message: 'Todo deleted' });
  }

  return res.status(405).json({ message: 'Method not allowed' });
};

export default withORM(handler);
