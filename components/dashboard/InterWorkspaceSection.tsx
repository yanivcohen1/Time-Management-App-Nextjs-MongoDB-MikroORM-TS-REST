"use client";

import { Stack, Typography } from "@mui/material";
import { InterWorkspacePanel } from "./InterWorkspacePanel";

export type InterWorkspaceSectionProps = {
  title?: string;
  description?: string;
};

const DEFAULT_TITLE = "Inter workspace";
const DEFAULT_DESCRIPTION = "Drill directly into onboarding needs or embed collaboration widgets specific to this workspace.";

export function InterWorkspaceSection({ title = DEFAULT_TITLE, description = DEFAULT_DESCRIPTION }: InterWorkspaceSectionProps) {
  return (
    <Stack spacing={2}>
      <Stack spacing={1}>
        <Typography variant="h3" fontWeight={700}>
          {title}
        </Typography>
        <Typography variant="body1" color="text.secondary">
          {description}
        </Typography>
      </Stack>
      <InterWorkspacePanel />
    </Stack>
  );
}
