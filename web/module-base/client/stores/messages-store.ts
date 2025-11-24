"use client";

import { create } from "zustand";

type Messages = Record<string, any>;

interface MessagesState {
  messages: {
    common: Messages;
    [moduleName: string]: Messages;
  };
  loadingModules: Set<string>;
  setCommonMessages: (messages: Messages) => void;
  setModuleMessages: (moduleName: string, messages: Messages) => void;
  getCombinedMessages: () => Messages;
  isLoadingModule: (moduleName: string) => boolean;
  setLoadingModule: (moduleName: string, loading: boolean) => void;
}

export const useMessagesStore = create<MessagesState>((set, get) => ({
  messages: {
    common: {},
  },
  loadingModules: new Set<string>(),

  setCommonMessages: (messages: Messages) => {
    set((state) => ({
      messages: {
        ...state.messages,
        common: messages,
      },
    }));
  },

  setModuleMessages: (moduleName: string, messages: Messages) => {
    set((state) => ({
      messages: {
        ...state.messages,
        [moduleName]: messages,
      },
      loadingModules: new Set(
        Array.from(state.loadingModules).filter((m) => m !== moduleName)
      ),
    }));
  },

  getCombinedMessages: () => {
    const state = get();
    const { common, ...moduleMessages } = state.messages;
    
    // Combine all messages: common first, then modules (later modules override earlier ones)
    return Object.values(moduleMessages).reduce(
      (acc, moduleMsg) => ({ ...acc, ...moduleMsg }),
      common
    );
  },

  isLoadingModule: (moduleName: string) => {
    return get().loadingModules.has(moduleName);
  },

  setLoadingModule: (moduleName: string, loading: boolean) => {
    set((state) => {
      const newLoadingModules = new Set(state.loadingModules);
      if (loading) {
        newLoadingModules.add(moduleName);
      } else {
        newLoadingModules.delete(moduleName);
      }
      return { loadingModules: newLoadingModules };
    });
  },
}));

