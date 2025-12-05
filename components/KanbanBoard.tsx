import React, { useState, useEffect } from 'react';
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd';
import { Box, Card, CardContent, Typography, Chip, IconButton } from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import api from '../lib/axios';
import TodoModal from './TodoModal';

interface Todo {
  id: string;
  title: string;
  description?: string;
  status: string;
  dueTime?: string;
}

const columns = {
  BACKLOG: 'Backlog',
  PENDING: 'Pending',
  IN_PROGRESS: 'In Progress',
  COMPLETED: 'Completed',
};

const KanbanBoard = () => {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [columnsData, setColumnsData] = useState<Record<string, Todo[]>>({
    BACKLOG: [],
    PENDING: [],
    IN_PROGRESS: [],
    COMPLETED: [],
  });
  const [editTodo, setEditTodo] = useState<Todo | undefined>(undefined);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const fetchTodos = async () => {
    try {
      const res = await api.get('/todos');
      setTodos(res.data);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    const load = async () => {
      try {
        const res = await api.get('/todos');
        setTodos(res.data);
      } catch (e) {
        console.error(e);
      }
    };
    load();
  }, []);

  useEffect(() => {
    const newColumns: Record<string, Todo[]> = {
      BACKLOG: [],
      PENDING: [],
      IN_PROGRESS: [],
      COMPLETED: [],
    };
    todos.forEach((todo) => {
      if (newColumns[todo.status]) {
        newColumns[todo.status].push(todo);
      }
    });
    // eslint-disable-next-line
    setColumnsData(newColumns);
  }, [todos]);

  const onDragEnd = async (result: DropResult) => {
    const { source, destination, draggableId } = result;

    if (!destination) return;

    if (source.droppableId === destination.droppableId && source.index === destination.index) {
      return;
    }

    const startColumn = columnsData[source.droppableId];
    const finishColumn = columnsData[destination.droppableId];

    // Optimistic update
    const newStartList = Array.from(startColumn);
    const [movedTodo] = newStartList.splice(source.index, 1);
    const newFinishList = Array.from(finishColumn);
    
    // If moving in same column
    if (source.droppableId === destination.droppableId) {
        newStartList.splice(destination.index, 0, movedTodo);
        setColumnsData({
            ...columnsData,
            [source.droppableId]: newStartList,
        });
    } else {
        // Moving to different column
        const updatedTodo = { ...movedTodo, status: destination.droppableId };
        newFinishList.splice(destination.index, 0, updatedTodo);
        setColumnsData({
            ...columnsData,
            [source.droppableId]: newStartList,
            [destination.droppableId]: newFinishList,
        });

        // API Call
        try {
            await api.put(`/todos/${draggableId}`, { status: destination.droppableId });
            // Refresh to ensure sync? Or just trust optimistic.
            // fetchTodos(); 
        } catch {
            // Revert on error (simplified: just fetch)
            fetchTodos();
        }
    }
  };

  const handleEdit = (todo: Todo) => {
    setEditTodo(todo);
    setIsModalOpen(true);
  };

  return (
    <Box sx={{ display: 'flex', overflowX: 'auto', height: '100%', gap: 2 }}>
      <DragDropContext onDragEnd={onDragEnd}>
        {Object.entries(columns).map(([columnId, columnTitle]) => (
          <Box key={columnId} sx={{ minWidth: 300, width: 300, display: 'flex', flexDirection: 'column' }}>
            <Typography variant="h6" sx={{ mb: 2, textAlign: 'center', fontWeight: 'bold' }}>
              {columnTitle}
            </Typography>
            <Droppable droppableId={columnId}>
              {(provided) => (
                <Box
                  {...provided.droppableProps}
                  ref={provided.innerRef}
                  sx={{
                    bgcolor: 'background.paper',
                    p: 2,
                    borderRadius: 2,
                    minHeight: 500,
                    flexGrow: 1,
                    boxShadow: 1,
                  }}
                >
                  {columnsData[columnId].map((todo, index) => (
                    <Draggable key={todo.id} draggableId={todo.id} index={index}>
                      {(provided, snapshot) => (
                        <Card
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          {...provided.dragHandleProps}
                          sx={{
                            mb: 2,
                            bgcolor: snapshot.isDragging ? 'action.hover' : 'background.default',
                            ...provided.draggableProps.style,
                          }}
                        >
                          <CardContent>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                <Typography variant="subtitle1" gutterBottom>
                                {todo.title}
                                </Typography>
                                <IconButton size="small" onClick={() => handleEdit(todo)}>
                                    <EditIcon fontSize="small" />
                                </IconButton>
                            </Box>
                            
                            {todo.dueTime && (
                              <Chip
                                label={new Date(todo.dueTime).toLocaleDateString()}
                                size="small"
                                color={new Date(todo.dueTime) < new Date() && todo.status !== 'COMPLETED' ? 'error' : 'default'}
                                sx={{ mt: 1 }}
                              />
                            )}
                          </CardContent>
                        </Card>
                      )}
                    </Draggable>
                  ))}
                  {provided.placeholder}
                </Box>
              )}
            </Droppable>
          </Box>
        ))}
      </DragDropContext>
      <TodoModal
        open={isModalOpen}
        onClose={() => { setIsModalOpen(false); setEditTodo(undefined); }}
        todo={editTodo}
        onSuccess={fetchTodos}
      />
    </Box>
  );
};

export default KanbanBoard;
