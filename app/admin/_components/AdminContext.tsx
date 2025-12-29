"use client";

import { createContext, useContext, useState, ReactNode } from "react";

type AdminContextType = {
  isAdminMode: boolean;
  toggleAdminMode: () => void;
};

const AdminContext = createContext<AdminContextType | undefined>(undefined);

type AdminSwitchContextValue = {
  interWorkspaceEnabled: boolean;
  setInterWorkspaceEnabled: (enabled: boolean) => void;
};

const AdminSwitchContext = createContext<AdminSwitchContextValue | undefined>(undefined);

export function AdminProvider({ children, adminId }: { children: ReactNode; adminId: string }) {
  const [isAdminMode, setIsAdminMode] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem(`isAdminMode-${adminId}`);
      return saved ? JSON.parse(saved) : false;
    }
    return false;
  });

  const toggleAdminMode = () => {
    setIsAdminMode((prev: boolean) => {
      const newValue = !prev;
      if (typeof window !== 'undefined') {
        localStorage.setItem(`isAdminMode-${adminId}`, JSON.stringify(newValue));
      }
      return newValue;
    });
  };

  return (
    <AdminContext.Provider value={{ isAdminMode, toggleAdminMode }}>
      {children}
    </AdminContext.Provider>
  );
}

export function useAdminContext() {
  const context = useContext(AdminContext);
  if (!context) {
    throw new Error("useAdminContext must be used within an AdminProvider");
  }
  return context;
}

export { AdminSwitchContext };

export function useAdminSwitch() {
  const context = useContext(AdminSwitchContext);
  if (!context) {
    throw new Error("useAdminSwitch must be used within the admin layout");
  }
  return context;
}