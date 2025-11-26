import { useEffect, useRef } from "react";

type Diff<T> = {
  [K in keyof T]?: { from: T[K]; to: T[K] };
};

/**
 * Debug hook: log ra vì sao component update.
 * Dùng cho object props/state, so sánh shallow từng key.
 */
export function useWhyDidUpdate<T extends Record<string, any>>(
  name: string,
  value: T
) {
  const previousRef = useRef<T | null>(null);

  useEffect(() => {
    if (previousRef.current === null) {
      previousRef.current = value;
      return;
    }

    const previous = previousRef.current;
    const changes: Diff<T> = {};

    const allKeys = new Set([
      ...Object.keys(previous),
      ...Object.keys(value),
    ]);

    allKeys.forEach((key) => {
      const prevVal = (previous as any)[key];
      const nextVal = (value as any)[key];

      if (prevVal !== nextVal) {
        (changes as any)[key] = { from: prevVal, to: nextVal };
      }
    });

    if (Object.keys(changes).length > 0) {
      // eslint-disable-next-line no-console
      console.log(`[whyDidUpdate] ${name}`, changes);
    }

    previousRef.current = value;
  });
}


