"use client";

import { ReactNode, Suspense } from "react";
import {AdminLayout} from "../AdminLayout";
import { CircularProgress, Box } from "@mui/material";

export default function AdminRouteLayout({ children }: { children: ReactNode }) {
  return (
    <Suspense
      fallback={
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh">
          <CircularProgress />
        </Box>
      }
    >
      <AdminLayout>{children}</AdminLayout>
    </Suspense>
  );
}