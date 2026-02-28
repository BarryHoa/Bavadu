"use client";

import type { BreadcrumbItem } from "../layouts/workspace/components/Breadcrumb";

import React, {
  createContext,
  useCallback,
  useContext,
  useRef,
  useState,
} from "react";

export interface WorkspaceState {
  currentModule: string | null;
  activeMenu: string | null;
  sidebarOpen: boolean;
  loading: boolean;
  error: string | null;
  breadcrumbs: BreadcrumbItem[];
}

export interface WorkspaceActions {
  setCurrentModule: (module: string | null) => void;
  setActiveMenu: (menu: string | null) => void;
  setSidebarOpen: (open: boolean) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  setBreadcrumbs: (items: BreadcrumbItem[]) => void;
  resetWorkspace: () => void;
  resetBreadcrumbs: () => void;
}

type WorkspaceContextValue = WorkspaceState & WorkspaceActions;

const defaultWorkspaceState: WorkspaceState = {
  currentModule: null,
  activeMenu: null,
  sidebarOpen: true,
  loading: false,
  error: null,
  breadcrumbs: [],
};

const WorkspaceContext = createContext<WorkspaceContextValue | undefined>(
  undefined
);

export function WorkspaceProvider({
  children,
  initialState,
  initialBreadcrumbs,
}: {
  children: React.ReactNode;
  initialState?: Partial<WorkspaceState>;
  initialBreadcrumbs?: BreadcrumbItem[];
}) {
  const initialBreadcrumbsRef = useRef(initialBreadcrumbs);
  initialBreadcrumbsRef.current = initialBreadcrumbs;

  const [state, setState] = useState<WorkspaceState>({
    ...defaultWorkspaceState,
    ...initialState,
    breadcrumbs: initialBreadcrumbs || [],
  });

  const setCurrentModule = useCallback((module: string | null) => {
    setState((prev) => ({ ...prev, currentModule: module }));
  }, []);

  const setActiveMenu = useCallback((menu: string | null) => {
    setState((prev) => ({ ...prev, activeMenu: menu }));
  }, []);

  const setSidebarOpen = useCallback((open: boolean) => {
    setState((prev) => ({ ...prev, sidebarOpen: open }));
  }, []);

  const setLoading = useCallback((loading: boolean) => {
    setState((prev) => ({ ...prev, loading }));
  }, []);

  const setError = useCallback((error: string | null) => {
    setState((prev) => ({ ...prev, error }));
  }, []);

  const setBreadcrumbs = useCallback((items: BreadcrumbItem[]) => {
    setState((prev) => ({ ...prev, breadcrumbs: items }));
  }, []);

  const resetWorkspace = useCallback(() => {
    setState(defaultWorkspaceState);
  }, []);

  const resetBreadcrumbs = useCallback(() => {
    setState((prev) => ({
      ...prev,
      breadcrumbs: initialBreadcrumbsRef.current || [],
    }));
  }, []);

  // React Compiler will automatically optimize this object creation
  const value = {
    ...state,
    setCurrentModule,
    setActiveMenu,
    setSidebarOpen,
    setLoading,
    setError,
    setBreadcrumbs,
    resetWorkspace,
    resetBreadcrumbs,
  };

  return (
    <WorkspaceContext.Provider value={value}>
      {children}
    </WorkspaceContext.Provider>
  );
}

export function useWorkspace() {
  const ctx = useContext(WorkspaceContext);

  if (!ctx) {
    throw new Error("useWorkspace must be used within WorkspaceProvider");
  }

  return ctx;
}

// Backward compatibility hook for breadcrumbs
export function useBreadcrumbs() {
  const ctx = useContext(WorkspaceContext);

  if (!ctx) {
    throw new Error("useBreadcrumbs must be used within WorkspaceProvider");
  }

  return {
    breadcrumbs: ctx.breadcrumbs,
    setBreadcrumbs: ctx.setBreadcrumbs,
    reset: ctx.resetBreadcrumbs,
  };
}
