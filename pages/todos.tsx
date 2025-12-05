import React, { useEffect, useState } from 'react';
import Layout from '../components/Layout';
import { useAuth } from '../context/AuthContext';
import { useRouter } from 'next/router';
import api from '../lib/axios';
import {
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Chip,
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import TodoModal from '../components/TodoModal';
import { useSnackbar } from 'notistack';

interface Todo {
  id: string;
  title: string;
  description?: string;
  status: string;
  dueTime?: string;
}

export default function Todos() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [todos, setTodos] = useState<Todo[]>([]);
  const [editTodo, setEditTodo] = useState<Todo | undefined>(undefined);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { enqueueSnackbar } = useSnackbar();

  const fetchTodos = async () => {
    try {
      const res = await api.get('/todos');
      setTodos(res.data);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

  useEffect(() => {
    if (user) {
      // eslint-disable-next-line
      fetchTodos();
    }
  }, [user]);

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this todo?')) {
      try {
        await api.delete(`/todos/${id}`);
        enqueueSnackbar('Todo deleted', { variant: 'success' });
        fetchTodos();
      } catch {
        // Handled by interceptor
      }
    }
  };

  const handleEdit = (todo: Todo) => {
    setEditTodo(todo);
    setIsModalOpen(true);
  };

  if (loading || !user) {
    return null;
  }

  return (
    <Layout>
      <Typography variant="h4" gutterBottom>
        Track Status
      </Typography>
      <TableContainer component={Paper}>
        <Table sx={{ minWidth: 650 }} aria-label="simple table">
          <TableHead>
            <TableRow>
              <TableCell>Title</TableCell>
              <TableCell>Description</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Due Date</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {todos.map((todo) => (
              <TableRow
                key={todo.id}
                sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
              >
                <TableCell component="th" scope="row">
                  {todo.title}
                </TableCell>
                <TableCell>{todo.description}</TableCell>
                <TableCell>
                  <Chip 
                    label={todo.status} 
                    color={todo.status === 'COMPLETED' ? 'success' : 'default'} 
                    size="small" 
                  />
                </TableCell>
                <TableCell>
                  {todo.dueTime ? new Date(todo.dueTime).toLocaleDateString() : '-'}
                </TableCell>
                <TableCell align="right">
                  <IconButton onClick={() => handleEdit(todo)}>
                    <EditIcon />
                  </IconButton>
                  <IconButton onClick={() => handleDelete(todo.id)} color="error">
                    <DeleteIcon />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
      <TodoModal
        open={isModalOpen}
        onClose={() => { setIsModalOpen(false); setEditTodo(undefined); }}
        todo={editTodo}
        onSuccess={fetchTodos}
      />
    </Layout>
  );
}
