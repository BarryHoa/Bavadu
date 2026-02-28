import { isNil, omitBy } from "lodash";
import isEmpty from "lodash/isEmpty";

const normalizePayload = <T extends Record<string, unknown>>(
  payload: Record<string, unknown>,
  opts?: {
    isUseDefaults?: boolean;
    defaults?: T;
    normalizeKeys?: {
      [K in keyof T]:
        | string
        | number
        | boolean
        | ((value: T[K]) => string | number | boolean);
    };
  },
) => {
  const { defaults, normalizeKeys } = opts ?? {};
  if (isEmpty(normalizeKeys)) {
    return {};
  }
  if (isEmpty(payload)) {
    if (opts?.isUseDefaults) {
      return { ...(defaults ?? {}) };
    }
    return {};
  }

  // normalize payload keys

  const normalizeResult = Object.keys(normalizeKeys).reduce(
    (acc, key) => {
      const value = payload[key] as any;
      if (isNil(value)) {
        return { ...acc, [key as keyof T]: null };
      }
      // normalize value based on normalizeKeys
      const normalizeFn = normalizeKeys[key as keyof T];
      if (typeof normalizeFn === "function") {
        // if normalizeFn is a function, call it with the value acc[key as keyof T] = normalizeFn(value);
        return {
          ...acc,
          [key as keyof T]: normalizeFn(value),
        };
      } else {
        let normalizedValue;
        switch (normalizeFn) {
          case "string":
            normalizedValue = String(value);
            break;
          case "number":
            normalizedValue = Number(value);
            break;
          case "boolean":
            normalizedValue = Boolean(value);
            break;
          default:
            acc[key as keyof T] = value;
            break;
        }
      }
      return acc;
    },
    {} as Record<keyof T, any>,
  );

  // only remove keys with value undefined
  return omitBy(normalizeResult, (value) => value === undefined) as T;
};

export default normalizePayload;
