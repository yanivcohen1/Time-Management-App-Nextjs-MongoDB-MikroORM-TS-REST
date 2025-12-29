"use client";

import { useState, useEffect, useRef } from "react";
import {
  Paper,
  Stack,
  Typography,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  Box
} from "@mui/material";
import { useSession } from "@/context/AuthContext";
import api from "@/lib/axios";

type InterWorkspacePanelProps = {
  title?: string;
  description?: string;
};

type SessionUser = {
  id: string;
  name: string;
  email: string;
  role: 'user' | 'admin';
};

type TodoDTO = {
  id: string;
  title: string;
  description?: string;
  status: string;
  dueTime?: string;
  tags?: string[];
};

type UsersResponse = {
  users: SessionUser[];
};

type TodosResponse = {
  items: TodoDTO[];
  total: number;
};

export function InterWorkspacePanel({
  title = "Inter workspace",
  description = "Centralize your teammate onboarding tasks and monitor their progress. This section is a placeholder for upcoming collaboration tooling."
}: InterWorkspacePanelProps) {
  const { data: session } = useSession();
  const [selectedUserId, setSelectedUserId] = useState<string>("");
  const [usersData, setUsersData] = useState<UsersResponse | null>(null);
  const [todosData, setTodosData] = useState<TodosResponse | null>(null);
  const usersFetched = useRef(false);
  const todosFetched = useRef(false);

  useEffect(() => {
    if (session?.user.role === "admin" && !usersFetched.current) {
      usersFetched.current = true;
      api.get<SessionUser[]>("users").then(({ data }) => setUsersData({ users: data }));
    }
  }, [session?.user.role]);

  useEffect(() => {
    todosFetched.current = false;
  }, [selectedUserId]);

  useEffect(() => {
    if (selectedUserId && session?.user.role === "admin" && !todosFetched.current) {
      todosFetched.current = true;
      api.get<TodosResponse>(`todos?userId=${selectedUserId}&limit=100`).then(({ data }) => setTodosData(data));
    }
  }, [selectedUserId, session?.user.role]);

  if (session?.user.role !== "admin") {
    return (
      <Paper sx={{ p: 3, borderRadius: 3 }}>
        <Stack spacing={1}>
          <Typography variant="h6">{title}</Typography>
          <Typography variant="body2" color="text.secondary">
            {description}
          </Typography>
        </Stack>
      </Paper>
    );
  }

  return (
    <Paper sx={{ p: 3, borderRadius: 3 }}>
      <Stack spacing={2}>
        <Stack spacing={1}>
          <Typography variant="h6">{title}</Typography>
          <Typography variant="body2" color="text.secondary">
            {description}
          </Typography>
        </Stack>

        <FormControl fullWidth>
          <InputLabel>Select User</InputLabel>
          <Select
            value={selectedUserId}
            label="Select User"
            onChange={(e) => {
              const value = e.target.value;
              setSelectedUserId(value);
              if (!value) {
                setTodosData(null);
              }
            }}
          >
            {usersData?.users.map((user) => (
              <MenuItem key={user.id} value={user.id}>
                {user.name} ({user.email})
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        {selectedUserId && todosData && (
          <Box>
            <Typography variant="h6" gutterBottom>
              Todos for {usersData?.users.find(u => u.id === selectedUserId)?.name}
            </Typography>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Title</TableCell>
                    <TableCell>Description</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Due Date</TableCell>
                    <TableCell>Tags</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {todosData.items.map((todo) => (
                    <TableRow key={todo.id}>
                      <TableCell>{todo.title}</TableCell>
                      <TableCell>{todo.description || "-"}</TableCell>
                      <TableCell>
                        <Chip
                          label={todo.status}
                          color={
                            todo.status === "COMPLETED" ? "success" :
                            todo.status === "IN_PROGRESS" ? "warning" : "default"
                          }
                          size="small"
                        />
                      </TableCell>
                      <TableCell>
                        {todo.dueTime ? new Date(todo.dueTime).toLocaleDateString() : "-"}
                      </TableCell>
                      <TableCell>
                        {todo.tags?.length ? todo.tags.join(", ") : "-"}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Box>
        )}
      </Stack>
    </Paper>
  );
}
