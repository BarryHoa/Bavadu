"use client";

import React, { createContext, useContext, useEffect, useState } from "react";

interface SettingsContextType {
  // Language settings
  selectedLanguage: string;
  setSelectedLanguage: (language: string) => void;
  locale: string;
  setLocale: (locale: string) => void;

  // Number format settings
  numberFormat: string;
  setNumberFormat: (format: string) => void;
  decimalPlaces: number;
  setDecimalPlaces: (places: number) => void;
  decimalSeparator: string;
  setDecimalSeparator: (separator: string) => void;
  thousandSeparator: string;
  setThousandSeparator: (separator: string) => void;
  formatNumber: (number: number) => string;

  // Background settings
  selectedBackground: string;
  setSelectedBackground: (background: string) => void;
  backgroundTransparency: number;
  setBackgroundTransparency: (transparency: number) => void;
  glassOpacity: number;
  setGlassOpacity: (opacity: number) => void;

  // General settings
  workspaceName: string;
  setWorkspaceName: (name: string) => void;
  workspaceDescription: string;
  setWorkspaceDescription: (description: string) => void;
  isPublicWorkspace: boolean;
  setIsPublicWorkspace: (isPublic: boolean) => void;

  // Notification settings
  emailNotifications: boolean;
  setEmailNotifications: (enabled: boolean) => void;
  pushNotifications: boolean;
  setPushNotifications: (enabled: boolean) => void;
  activityUpdates: boolean;
  setActivityUpdates: (enabled: boolean) => void;

  // Security settings
  twoFactorAuth: boolean;
  setTwoFactorAuth: (enabled: boolean) => void;
  sessionTimeout: boolean;
  setSessionTimeout: (enabled: boolean) => void;
  sessionTimeoutDuration: number;
  setSessionTimeoutDuration: (duration: number) => void;

  // Utility functions
  resetSettings: () => void;
  saveSettings: () => void;
}

const defaultSettings = {
  selectedLanguage: "en",
  locale: "en",
  numberFormat: "US",
  decimalPlaces: 2,
  decimalSeparator: ".",
  thousandSeparator: ",",
  selectedBackground: "bg_1",
  backgroundTransparency: 20,
  glassOpacity: 50,
  workspaceName: "My Workspace",
  workspaceDescription: "",
  isPublicWorkspace: false,
  emailNotifications: true,
  pushNotifications: false,
  activityUpdates: true,
  twoFactorAuth: false,
  sessionTimeout: true,
  sessionTimeoutDuration: 30,
};

const SettingsContext = createContext<SettingsContextType | undefined>(
  undefined,
);

export function SettingsProvider({ children }: { children: React.ReactNode }) {
  const [settings, setSettings] = useState(defaultSettings);

  // Load settings from localStorage on mount
  useEffect(() => {
    const savedSettings = localStorage.getItem("workspace-settings");

    if (savedSettings) {
      try {
        const parsed = JSON.parse(savedSettings);

        setSettings({ ...defaultSettings, ...parsed });
      } catch (error) {
        console.error("Error loading settings:", error);
      }
    }
  }, []);

  // Save settings to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem("workspace-settings", JSON.stringify(settings));
  }, [settings]);

  const updateSetting = <K extends keyof typeof settings>(
    key: K,
    value: (typeof settings)[K],
  ) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
  };

  const resetSettings = () => {
    setSettings(defaultSettings);
    localStorage.removeItem("workspace-settings");
  };

  const saveSettings = () => {
    // In a real app, this would save to a backend
    console.log("Settings saved:", settings);
  };

  const contextValue: SettingsContextType = {
    // Language settings
    selectedLanguage: settings.selectedLanguage,
    setSelectedLanguage: (language) =>
      updateSetting("selectedLanguage", language),
    locale: settings.locale,
    setLocale: (locale) => updateSetting("locale", locale),

    // Number format settings
    numberFormat: settings.numberFormat,
    setNumberFormat: (format) => updateSetting("numberFormat", format),
    decimalPlaces: settings.decimalPlaces,
    setDecimalPlaces: (places) => updateSetting("decimalPlaces", places),
    decimalSeparator: settings.decimalSeparator,
    setDecimalSeparator: (separator) =>
      updateSetting("decimalSeparator", separator),
    thousandSeparator: settings.thousandSeparator,
    setThousandSeparator: (separator) =>
      updateSetting("thousandSeparator", separator),
    formatNumber: (number: number) => {
      return new Intl.NumberFormat("en-US", {
        minimumFractionDigits: settings.decimalPlaces,
        maximumFractionDigits: settings.decimalPlaces,
      })
        .format(number)
        .replace(/,/g, settings.thousandSeparator)
        .replace(/\./g, settings.decimalSeparator);
    },

    // Background settings
    selectedBackground: settings.selectedBackground,
    setSelectedBackground: (background) =>
      updateSetting("selectedBackground", background),
    backgroundTransparency: settings.backgroundTransparency,
    setBackgroundTransparency: (transparency) =>
      updateSetting("backgroundTransparency", transparency),
    glassOpacity: settings.glassOpacity,
    setGlassOpacity: (opacity) => updateSetting("glassOpacity", opacity),

    // General settings
    workspaceName: settings.workspaceName,
    setWorkspaceName: (name) => updateSetting("workspaceName", name),
    workspaceDescription: settings.workspaceDescription,
    setWorkspaceDescription: (description) =>
      updateSetting("workspaceDescription", description),
    isPublicWorkspace: settings.isPublicWorkspace,
    setIsPublicWorkspace: (isPublic) =>
      updateSetting("isPublicWorkspace", isPublic),

    // Notification settings
    emailNotifications: settings.emailNotifications,
    setEmailNotifications: (enabled) =>
      updateSetting("emailNotifications", enabled),
    pushNotifications: settings.pushNotifications,
    setPushNotifications: (enabled) =>
      updateSetting("pushNotifications", enabled),
    activityUpdates: settings.activityUpdates,
    setActivityUpdates: (enabled) => updateSetting("activityUpdates", enabled),

    // Security settings
    twoFactorAuth: settings.twoFactorAuth,
    setTwoFactorAuth: (enabled) => updateSetting("twoFactorAuth", enabled),
    sessionTimeout: settings.sessionTimeout,
    setSessionTimeout: (enabled) => updateSetting("sessionTimeout", enabled),
    sessionTimeoutDuration: settings.sessionTimeoutDuration,
    setSessionTimeoutDuration: (duration) =>
      updateSetting("sessionTimeoutDuration", duration),

    // Utility functions
    resetSettings,
    saveSettings,
  };

  return (
    <SettingsContext.Provider value={contextValue}>
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings() {
  const context = useContext(SettingsContext);

  if (context === undefined) {
    throw new Error("useSettings must be used within a SettingsProvider");
  }

  return context;
}
