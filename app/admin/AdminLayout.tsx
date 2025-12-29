"use client";

import { createContext, useContext, useState, useMemo, ReactNode } from "react";
import { Box, Button, CircularProgress, FormControlLabel, Paper, Stack, Switch, Typography } from "@mui/material";
import { usePathname, useRouter, useParams, useSearchParams } from "next/navigation";
import { BreadCrumb } from "primereact/breadcrumb";
import { MenuItem } from "primereact/menuitem";
import { tokenStorage } from "@/lib/http/token-storage";
import { AdminOverviewCard } from "./[adminId]/AdminOverviewCard";
import { UserOverviewCard } from "./[adminId]/user/[userId]/UserOverviewCard";
import { AdminProvider } from "./_components/AdminContext";

type AdminSwitchContextValue = {
  interWorkspaceEnabled: boolean;
  setInterWorkspaceEnabled: (enabled: boolean) => void;
};

const AdminSwitchContext = createContext<AdminSwitchContextValue | undefined>(undefined);

export function useAdminSwitch() {
  const context = useContext(AdminSwitchContext);
  if (!context) {
    throw new Error("useAdminSwitch must be used within the admin layout");
  }
  return context;
}

export function AdminLayout({ children }: { children: ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const params = useParams();
  const searchParams = useSearchParams();
  const adminId = params?.adminId as string | undefined;
  const userId = params?.userId as string | undefined;

  const getQueryValue = (key: string) => {
    const value = searchParams.getAll(key);
    if (value.length === 0) {
      return "Not provided";
    }
    return value.join(", ");
  };

  const queryId = getQueryValue("id");
  const queryName = getQueryValue("name");

  const hasToken = !!tokenStorage.getAccessToken();
  const [activeView, setActiveView] = useState<"admin" | "user">(() => (pathname?.includes("/user/") ? "user" : "admin"));
  const resolvedActiveView = pathname?.startsWith("/admin") ? (pathname.includes("/user/") ? "user" : "admin") : activeView;
  const transitionKey = pathname ?? resolvedActiveView ?? "admin";
  const defaultInterWorkspaceEnabled = pathname?.includes("/user/") ?? false;
  const [interWorkspaceEnabled, setInterWorkspaceEnabled] = useState(defaultInterWorkspaceEnabled);

  const handleInterWorkspaceToggle = (enabled: boolean) => {
    setInterWorkspaceEnabled(enabled);
  };
  
  const breadcrumbItems: MenuItem[] = useMemo(
    () => [
      {
        label: "Admin",
        icon: "pi pi-shield",
        command: () => {
          setActiveView("admin");
          router.push("/admin/1");
        }
      },
      {
        label: "User",
        icon: "pi pi-user",
        command: () => {
          setActiveView("user");
          router.push("/admin/3/user/2?id=1&name=yar");
        }
      }
    ],
    [router]
  );

  const home: MenuItem = useMemo(
    () => ({
      icon: <span className="pi pi-home" aria-label="Home" />,
      url: "/"
    }),
    []
  );

  return (
    <AdminSwitchContext.Provider value={{ interWorkspaceEnabled, setInterWorkspaceEnabled: handleInterWorkspaceToggle }}>
      <main>
        <Box sx={{ px: { xs: 2, md: 6 }, py: 6 }}>
          <Stack spacing={3}>
            <Paper sx={{ p: 2, borderRadius: 3 }}>
              <BreadCrumb home={home} model={breadcrumbItems} />
            </Paper>
            <Stack
              direction={{ xs: "column", md: "row" }}
              alignItems={{ xs: "flex-start", md: "center" }}
              justifyContent="space-between"
              spacing={2}
            >
              <Stack spacing={1}>
                <Typography variant="h3" fontWeight={700}>
                  Admin console
                </Typography>
                <Typography variant="body1" color="text.secondary">
                  Manage roles, enforce rate limits, and review access logs across the workspace.
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Currently viewing: {resolvedActiveView === "admin" ? "Admin overview" : "User details"}
                </Typography>
              </Stack>

              <FormControlLabel
                control={
                  <Switch
                    key={`${transitionKey}-${interWorkspaceEnabled ? "on" : "off"}`}
                    color="primary"
                    checked={interWorkspaceEnabled}
                    onChange={(_, checked) => handleInterWorkspaceToggle(checked)}
                  />
                }
                label={interWorkspaceEnabled ? "User workspace enabled" : "User workspace disabled"}
              />
            </Stack>
            <Stack spacing={3}>
              {children}
              {adminId ? (
                <AdminProvider adminId={adminId}>
                  <AdminOverviewCard adminId={adminId} key={adminId}/>
                  {userId ? (
                    <>
                      <UserOverviewCard userId={userId} queryId={queryId} queryName={queryName} />
                    </>
                  ) : (
                    <></>
                  )}
                </AdminProvider>
              ) : (
                <></>
              )}
            </Stack>
          </Stack>
        </Box>
      </main>
    </AdminSwitchContext.Provider>
  );
}
