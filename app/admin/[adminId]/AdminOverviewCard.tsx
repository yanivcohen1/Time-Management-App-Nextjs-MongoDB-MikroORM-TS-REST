"use client";

import { FormControlLabel, Paper, Stack, Switch, Typography } from "@mui/material";
import { useState } from "react";

export type AdminOverviewCardProps = {
  adminId: string;
};

export function AdminOverviewCard({ adminId }: AdminOverviewCardProps) {
  const [isAdminMode, setIsAdminMode] = useState(false);

  const toggleAdminMode = () => {
    setIsAdminMode((prev) => !prev);
  };

  return (
    <Paper sx={{ p: 3, borderRadius: 3 }}>
      <Stack spacing={1.5}>
        <Typography variant="h4" fontWeight={700}>
          Admin view
        </Typography>
        <Typography variant="body1">Displaying admin id: {adminId}</Typography>
        <FormControlLabel
          control={<Switch checked={isAdminMode} onChange={toggleAdminMode} />}
          label="Enable Admin Mode"
        />
        <Typography variant="body2" color="text.secondary">
          Use the breadcrumb actions above to jump between the admin record at /admin/1 and the user details view.
        </Typography>
      </Stack>
    </Paper>
  );
}
