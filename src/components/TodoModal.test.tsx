import { expect, describe, it, beforeEach, vi } from 'vitest';
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import TodoModal from './TodoModal';
import { apiClient } from '../lib/api-client';

// Mock dependencies
vi.mock('../lib/api-client', () => ({
  apiClient: {
    todos: {
      createTodo: vi.fn(),
      updateTodo: vi.fn(),
    },
  },
}));
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn(),
    reload: vi.fn(),
  }),
}));
vi.mock('notistack', () => ({
  useSnackbar: () => ({
    enqueueSnackbar: vi.fn(),
  }),
}));

describe('TodoModal', () => {
  const mockOnClose = vi.fn();
  const mockOnSuccess = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders correctly when open', () => {
    render(
      <TodoModal
        open={true}
        onClose={mockOnClose}
        onSuccess={mockOnSuccess}
      />
    );

    expect(screen.getByText('Create Todo')).toBeInTheDocument();
    expect(screen.getByLabelText('Title')).toBeInTheDocument();
    expect(screen.getByLabelText('Description')).toBeInTheDocument();
  });

  it('submits the form correctly', async () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    vi.mocked(apiClient.todos.createTodo).mockResolvedValue({ status: 201, body: {} } as any);

    render(
      <TodoModal
        open={true}
        onClose={mockOnClose}
        onSuccess={mockOnSuccess}
      />
    );

    fireEvent.change(screen.getByLabelText('Title'), { target: { value: 'New Todo' } });
    fireEvent.change(screen.getByLabelText('Description'), { target: { value: 'New Description' } });
    
    fireEvent.click(screen.getByText('Create'));

    await waitFor(() => {
      expect(apiClient.todos.createTodo).toHaveBeenCalledWith({
        body: {
          title: 'New Todo',
          description: 'New Description',
          status: 'BACKLOG',
          dueTime: undefined,
          duration: undefined,
        }
      });
      expect(mockOnSuccess).toHaveBeenCalled();
      expect(mockOnClose).toHaveBeenCalled();
    });
  });

  it('populates form when editing an existing todo', () => {
    const todo = {
      id: '1',
      title: 'Existing Todo',
      description: 'Existing Description',
      status: 'IN_PROGRESS',
      dueTime: '2023-01-01T12:00:00.000Z',
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    render(
      <TodoModal
        open={true}
        onClose={mockOnClose}
        onSuccess={mockOnSuccess}
        todo={todo}
      />
    );

    expect(screen.getByText('Edit Todo')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Existing Todo')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Existing Description')).toBeInTheDocument();
  });
});
