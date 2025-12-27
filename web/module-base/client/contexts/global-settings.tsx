"use client";

import React, { createContext, useContext, useState } from "react";

export interface GlobalSettings {
  theme: "light" | "dark" | "system";
  language: string;
  notifications: boolean;
  autoSave: boolean;
  sidebarCollapsed: boolean;
}

type GlobalSettingsContextValue = {
  settings: GlobalSettings;
  updateSettings: (newSettings: Partial<GlobalSettings>) => void;
  resetSettings: () => void;
};

const defaultSettings: GlobalSettings = {
  theme: "system",
  language: "en",
  notifications: true,
  autoSave: true,
  sidebarCollapsed: false,
};

const GlobalSettingsContext = createContext<
  GlobalSettingsContextValue | undefined
>(undefined);

export function GlobalSettingsProvider({
  children,
  initialSettings,
}: {
  children: React.ReactNode;
  initialSettings?: Partial<GlobalSettings>;
}) {
  const [settings, setSettings] = useState<GlobalSettings>({
    ...defaultSettings,
    ...initialSettings,
  });

  const updateSettings = (newSettings: Partial<GlobalSettings>) => {
    setSettings((prev) => ({ ...prev, ...newSettings }));
  };

  const resetSettings = () => {
    setSettings(defaultSettings);
  };

  // React Compiler will automatically optimize this object creation
  const value = {
    settings,
    updateSettings,
    resetSettings,
  };

  return (
    <GlobalSettingsContext.Provider value={value}>
      {children}
    </GlobalSettingsContext.Provider>
  );
}

export function useGlobalSettings() {
  const ctx = useContext(GlobalSettingsContext);

  if (!ctx) {
    throw new Error(
      "useGlobalSettings must be used within GlobalSettingsProvider",
    );
  }

  return ctx;
}
