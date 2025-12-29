"use client";

import { FormControlLabel, Paper, Stack, Switch, Typography } from "@mui/material";
import { useAdminSwitch } from "../../../AdminLayout";

export type UserOverviewCardProps = {
  userId: string;
  queryId?: string;
  queryName?: string;
};

export function UserOverviewCard({ userId, queryId, queryName }: UserOverviewCardProps) {
  const { interWorkspaceEnabled, setInterWorkspaceEnabled } = useAdminSwitch();

  return (
    <Paper sx={{ p: 3, borderRadius: 3 }}>
      <Stack spacing={1.5}>
        <Typography variant="h4" fontWeight={700}>
          User Details
        </Typography>
        <Typography variant="body1">Displaying user id: {userId}</Typography>
        {queryId && queryName && (
          <>
            <Typography variant="body2" color="text.secondary">
              Query parameters
            </Typography>
            <Typography variant="body2">id: {queryId}</Typography>
            <Typography variant="body2">name: {queryName}</Typography>
          </>
        )}
        <Typography variant="body2" color="text.secondary">
          Manage specific user settings and view their activity logs.
        </Typography>
        <FormControlLabel
          control={
            <Switch
              checked={interWorkspaceEnabled}
              onChange={(e) => setInterWorkspaceEnabled(e.target.checked)}
            />
          }
          label={interWorkspaceEnabled ? "User workspace enabled" : "User workspace disabled"}
        />
      </Stack>
    </Paper>
  );
}
