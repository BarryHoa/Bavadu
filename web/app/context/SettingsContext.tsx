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

  // Language settings
  locale: string;
  setLocale: (locale: string) => void;

  // Number format settings
  decimalPlaces: number;
  setDecimalPlaces: (places: number) => void;
  decimalSeparator: string;
  setDecimalSeparator: (separator: string) => void;
  thousandSeparator: string;
  setThousandSeparator: (separator: string) => void;

  // Utility function
  formatNumber: (value: number) => string;

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
  locale: "en",
  decimalPlaces: 2,
  decimalSeparator: ".",
  thousandSeparator: ",",
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
  const [locale, setLocale] = useState(DEFAULT_SETTINGS.locale);
  const [decimalPlaces, setDecimalPlaces] = useState(
    DEFAULT_SETTINGS.decimalPlaces
  );
  const [decimalSeparator, setDecimalSeparator] = useState(
    DEFAULT_SETTINGS.decimalSeparator
  );
  const [thousandSeparator, setThousandSeparator] = useState(
    DEFAULT_SETTINGS.thousandSeparator
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
    const savedLocale = localStorage.getItem("locale");
    const savedDecimalPlaces = localStorage.getItem("decimalPlaces");
    const savedDecimalSeparator = localStorage.getItem("decimalSeparator");
    const savedThousandSeparator = localStorage.getItem("thousandSeparator");

    if (savedBackground) setSelectedBackground(savedBackground);
    if (savedTransparency)
      setBackgroundTransparency(parseInt(savedTransparency));
    if (savedGlassOpacity) setGlassOpacity(parseInt(savedGlassOpacity));
    if (savedBlurIntensity) setBlurIntensity(parseInt(savedBlurIntensity));
    if (savedLocale) setLocale(savedLocale);
    if (savedDecimalPlaces) setDecimalPlaces(parseInt(savedDecimalPlaces));
    if (savedDecimalSeparator) setDecimalSeparator(savedDecimalSeparator);
    if (savedThousandSeparator) setThousandSeparator(savedThousandSeparator);
  };

  const saveSettings = () => {
    localStorage.setItem("selectedBackground", selectedBackground);
    localStorage.setItem(
      "backgroundTransparency",
      backgroundTransparency.toString()
    );
    localStorage.setItem("glassOpacity", glassOpacity.toString());
    localStorage.setItem("blurIntensity", blurIntensity.toString());
    localStorage.setItem("locale", locale);
    localStorage.setItem("decimalPlaces", decimalPlaces.toString());
    localStorage.setItem("decimalSeparator", decimalSeparator);
    localStorage.setItem("thousandSeparator", thousandSeparator);
  };

  const resetSettings = () => {
    setSelectedBackground(DEFAULT_SETTINGS.selectedBackground);
    setBackgroundTransparency(DEFAULT_SETTINGS.backgroundTransparency);
    setGlassOpacity(DEFAULT_SETTINGS.glassOpacity);
    setBlurIntensity(DEFAULT_SETTINGS.blurIntensity);
    setLocale(DEFAULT_SETTINGS.locale);
    setDecimalPlaces(DEFAULT_SETTINGS.decimalPlaces);
    setDecimalSeparator(DEFAULT_SETTINGS.decimalSeparator);
    setThousandSeparator(DEFAULT_SETTINGS.thousandSeparator);

    // Clear localStorage
    localStorage.removeItem("selectedBackground");
    localStorage.removeItem("backgroundTransparency");
    localStorage.removeItem("glassOpacity");
    localStorage.removeItem("blurIntensity");
    localStorage.removeItem("locale");
    localStorage.removeItem("decimalPlaces");
    localStorage.removeItem("decimalSeparator");
    localStorage.removeItem("thousandSeparator");
  };

  const formatNumber = (value: number): string => {
    // Format number with current settings
    const fixedValue = value.toFixed(decimalPlaces);
    const [integerPart, decimalPart] = fixedValue.split(".");

    // Add thousand separators
    const formattedInteger = integerPart.replace(
      /\B(?=(\d{3})+(?!\d))/g,
      thousandSeparator
    );

    // Combine with decimal separator
    if (decimalPlaces > 0 && decimalPart) {
      return `${formattedInteger}${decimalSeparator}${decimalPart}`;
    }

    return formattedInteger;
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
        locale,
        setLocale,
        decimalPlaces,
        setDecimalPlaces,
        decimalSeparator,
        setDecimalSeparator,
        thousandSeparator,
        setThousandSeparator,
        formatNumber,
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
