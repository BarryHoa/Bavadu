"use client";

import React, { createContext, useContext, useEffect, useState } from "react";

interface SettingsContextType {
  // Background settings
  selectedBackground: string;
  setSelectedBackground: (bg: string) => void;

  // Transparency settings
  backgroundTransparency: number;
  setBackgroundTransparency: (transparency: number) => void;

  // Glass effect settings
  glassOpacity: number;
  setGlassOpacity: (opacity: number) => void;

  // Blur settings
  blurIntensity: number;
  setBlurIntensity: (intensity: number) => void;

  // Actions
  saveSettings: () => void;
  resetSettings: () => void;
  loadSettings: () => void;
}

const SettingsContext = createContext<SettingsContextType | undefined>(
  undefined
);

const DEFAULT_SETTINGS = {
  selectedBackground: "bg_1",
  backgroundTransparency: 50,
  glassOpacity: 30,
  blurIntensity: 12,
};

export function SettingsProvider({ children }: { children: React.ReactNode }) {
  const [selectedBackground, setSelectedBackground] = useState(
    DEFAULT_SETTINGS.selectedBackground
  );
  const [backgroundTransparency, setBackgroundTransparency] = useState(
    DEFAULT_SETTINGS.backgroundTransparency
  );
  const [glassOpacity, setGlassOpacity] = useState(
    DEFAULT_SETTINGS.glassOpacity
  );
  const [blurIntensity, setBlurIntensity] = useState(
    DEFAULT_SETTINGS.blurIntensity
  );

  // Load settings from localStorage on mount
  useEffect(() => {
    loadSettings();
  }, []);

  // Apply CSS variables when glass opacity changes
  useEffect(() => {
    document.documentElement.style.setProperty(
      "--glass-opacity",
      `${glassOpacity / 100}`
    );
    document.documentElement.style.setProperty(
      "--glass-opacity-percent",
      `${glassOpacity}`
    );
  }, [glassOpacity]);

  // Apply blur intensity
  useEffect(() => {
    document.documentElement.style.setProperty(
      "--blur-intensity",
      `${blurIntensity}px`
    );
  }, [blurIntensity]);

  const loadSettings = () => {
    const savedBackground = localStorage.getItem("selectedBackground");
    const savedTransparency = localStorage.getItem("backgroundTransparency");
    const savedGlassOpacity = localStorage.getItem("glassOpacity");
    const savedBlurIntensity = localStorage.getItem("blurIntensity");

    if (savedBackground) setSelectedBackground(savedBackground);
    if (savedTransparency)
      setBackgroundTransparency(parseInt(savedTransparency));
    if (savedGlassOpacity) setGlassOpacity(parseInt(savedGlassOpacity));
    if (savedBlurIntensity) setBlurIntensity(parseInt(savedBlurIntensity));
  };

  const saveSettings = () => {
    localStorage.setItem("selectedBackground", selectedBackground);
    localStorage.setItem(
      "backgroundTransparency",
      backgroundTransparency.toString()
    );
    localStorage.setItem("glassOpacity", glassOpacity.toString());
    localStorage.setItem("blurIntensity", blurIntensity.toString());
  };

  const resetSettings = () => {
    setSelectedBackground(DEFAULT_SETTINGS.selectedBackground);
    setBackgroundTransparency(DEFAULT_SETTINGS.backgroundTransparency);
    setGlassOpacity(DEFAULT_SETTINGS.glassOpacity);
    setBlurIntensity(DEFAULT_SETTINGS.blurIntensity);

    // Clear localStorage
    localStorage.removeItem("selectedBackground");
    localStorage.removeItem("backgroundTransparency");
    localStorage.removeItem("glassOpacity");
    localStorage.removeItem("blurIntensity");
  };

  return (
    <SettingsContext.Provider
      value={{
        selectedBackground,
        setSelectedBackground,
        backgroundTransparency,
        setBackgroundTransparency,
        glassOpacity,
        setGlassOpacity,
        blurIntensity,
        setBlurIntensity,
        saveSettings,
        resetSettings,
        loadSettings,
      }}
    >
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings() {
  const context = useContext(SettingsContext);
  if (context === undefined) {
    throw new Error("useSettings must be used within SettingsProvider");
  }
  return context;
}
