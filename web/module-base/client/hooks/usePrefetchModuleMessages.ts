"use client";

import { useEffect } from "react";

import { useMessagesStore } from "@base/client/stores/messages-store";

/**
 * Hook to prefetch messages for all modules except current one
 */
export function usePrefetchModuleMessages(
  allModuleNames: string[],
  currentModule: string | null,
  locale: string,
) {
  const { setModuleMessages, setLoadingModule, isLoadingModule } =
    useMessagesStore();

  useEffect(() => {
    // Get modules that need to be loaded (exclude current module)
    const state = useMessagesStore.getState();
    const modulesToLoad = allModuleNames.filter(
      (moduleName) =>
        moduleName !== currentModule &&
        !isLoadingModule(moduleName) &&
        !state.messages[moduleName],
    );

    if (modulesToLoad.length === 0) return;

    // Prefetch all module messages in parallel
    const prefetchPromises = modulesToLoad.map(async (moduleName) => {
      setLoadingModule(moduleName, true);

      try {
        const moduleMessages = await import(
          `@mdl/${moduleName}/client/messages/${locale}.json`
        )
          .then((module) => module.default)
          .catch(() => ({}));

        // Store module messages
        setModuleMessages(moduleName, moduleMessages);
      } catch (error) {
        console.error(
          `Error loading messages for module ${moduleName}:`,
          error,
        );
        // Set empty object on error
        setModuleMessages(moduleName, {});
      } finally {
        setLoadingModule(moduleName, false);
      }
    });

    // Execute all prefetches
    Promise.all(prefetchPromises).catch((error) => {
      console.error("Error prefetching module messages:", error);
    });
  }, [
    allModuleNames,
    currentModule,
    locale,
    setModuleMessages,
    setLoadingModule,
    isLoadingModule,
  ]);
}
