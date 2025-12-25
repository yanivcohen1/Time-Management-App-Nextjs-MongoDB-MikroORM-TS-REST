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

  const filter = userPayload.role === 'admin' ? { id: id as string } : { id: id as string, owner: userPayload.userId };
  const todo = await em.findOne(Todo, filter);

  if (!todo) {
    return res.status(404).json({ message: 'Todo not found' });
  }

  if (req.method === 'PUT') {
    const { title, description, status, dueTime, duration } = req.body;
    
    if (title !== undefined) todo.title = title;
    if (description !== undefined) todo.description = description;
    if (status !== undefined) todo.status = status;
    if (dueTime !== undefined) {
      if (dueTime) {
        const dueDate = new Date(dueTime);
        if (isNaN(dueDate.getTime())) {
          return res.status(400).json({ message: 'Invalid dueTime format' });
        }
        todo.dueTime = dueDate;
      } else {
        todo.dueTime = undefined;
      }
    }
    if (duration !== undefined) todo.duration = duration;

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
