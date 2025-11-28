"use client";

import React, { useLayoutEffect } from "react";
import {
  getRootStoreValue,
  hasRootStore,
  rootStore,
  setRootStoreValue,
} from "./root-store";

// Options for creating a store
export interface CreateStoreOptions<T> {
  key: string;
  init: T;
  persist?: boolean;
  persistName?: string;
  devtools?: boolean;
  devtoolsName?: string;
}

// Return type for createStore
export interface StoreHook<T> {
  getValue: () => T;
  setValue: (value: T) => void;
  clearValue: () => void;
}

export interface CreateStoreReturn<T> {
  storeKey: string;
  initValue: T;
  useStore: () => StoreHook<T>;
  useSelector: <R = T>(selector: (value: T) => R) => R;
  getValue: () => T;
  setValue: (value: T) => void;
  clearValue: () => void;
}

/**
 * Create a dynamic store with key and initial value
 * Similar to Redux global store pattern
 *
 * @param options - Store configuration options
 * @returns Store hook and utilities
 *
 * @example
 * ```ts
 * const counterStore = createStore({
 *   key: 'counter',
 *   init: 0,
 *   persist: true
 * });
 *
 * // Use hook
 * const { getValue, setValue, clearValue } = counterStore.useStore();
 *
 * // Use selector hook
 * const count = counterStore.useSelector(state => state);
 *
 * // Direct access
 * counterStore.setValue(10);
 * const value = counterStore.getValue();
 * ```
 */
/**
 * Create a store definition (chưa inject vào root-store)
 * Cần dùng HOC inject() để inject vào root-store
 */
export function createStore<T>(
  options: CreateStoreOptions<T>
): CreateStoreReturn<T> {
  const { key, init } = options;

  const store: CreateStoreReturn<T> = {
    storeKey: key,
    initValue: init,
    // Hook - chỉ subscribe vào key cụ thể, không re-render khi key khác thay đổi
    useStore: () => {
      // Sử dụng selector để chỉ lấy value của key này
      // Zustand sẽ tự động so sánh và chỉ re-render khi value thay đổi
      const value = rootStore((state) => {
        return (state.stores.get(key) as T | undefined) ?? init;
      });

      return {
        getValue: () => value,
        setValue: (newValue: T) => setRootStoreValue(key, newValue),
        clearValue: () => setRootStoreValue(key, init),
      };
    },

    // Selector hook - chỉ subscribe vào key cụ thể
    useSelector: <R = T>(selector: (value: T) => R) => {
      return rootStore((state) => {
        const value = (state.stores.get(key) as T | undefined) ?? init;
        return selector(value);
      });
    },

    // Direct access (không subscribe, không gây re-render)
    getValue: () => {
      return (getRootStoreValue<T>(key) ?? init) as T;
    },

    setValue: (value: T) => {
      setRootStoreValue(key, value);
    },

    clearValue: () => {
      setRootStoreValue(key, init);
    },
  };

  return store;
}

/**
 * Inject stores into root-store
 * HOC để inject các stores vào root-store khi component mount
 *
 * @param stores - Array of store objects to inject
 * @returns HOC function
 *
 * @example
 * ```ts
 * const counterStore = createStore({ key: 'counter', init: 0 });
 * const userStore = createStore({ key: 'user', init: null });
 *
 * const MyComponent = inject([counterStore, userStore])(() => {
 *   const { getValue } = counterStore.useStore();
 *   return <div>{getValue()}</div>;
 * });
 * ```
 */
export function inject(stores: CreateStoreReturn<any>[]) {
  return function store<P extends object>(Component: React.ComponentType<P>) {
    function InjectedComponent(props: P) {
      // Inject stores vào root-store đồng bộ trước khi paint, chỉ chạy một lần
      // useLayoutEffect chạy đồng bộ trước khi browser paint, đảm bảo stores sẵn sàng
      useLayoutEffect(() => {
        stores.forEach((store) => {
          if (!hasRootStore(store.storeKey)) {
            setRootStoreValue(store.storeKey, store.initValue);
          }
        });
      }, []); // Empty deps - chỉ chạy một lần khi mount

      return React.createElement(Component, props);
    }

    InjectedComponent.displayName = `inject(${Component.displayName || Component.name || "Component"})`;

    return InjectedComponent;
  };
}
