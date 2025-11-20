/**
 * Field whitelisting utilities to prevent mass assignment attacks
 * Only allow explicitly whitelisted fields to be used in create/update operations
 */

/**
 * Whitelist fields from an object, returning only the allowed fields
 * @param data - The input data object
 * @param allowedFields - Array of field names that are allowed
 * @returns Object containing only whitelisted fields
 */
export function whitelistFields<T extends Record<string, unknown>>(
  data: T,
  allowedFields: (keyof T)[]
): Partial<T> {
  const result: Partial<T> = {};

  for (const field of allowedFields) {
    if (field in data && data[field] !== undefined) {
      result[field] = data[field];
    }
  }

  return result;
}

/**
 * Whitelist fields with type safety
 * @param data - The input data object
 * @param allowedFields - Array of field names that are allowed
 * @returns Object containing only whitelisted fields with proper typing
 */
export function whitelistFieldsTyped<
  T extends Record<string, unknown>,
  K extends keyof T
>(data: T, allowedFields: readonly K[]): Pick<T, K> {
  const result = {} as Pick<T, K>;

  for (const field of allowedFields) {
    if (field in data && data[field] !== undefined) {
      result[field] = data[field] as T[K];
    }
  }

  return result;
}

/**
 * Whitelist fields from nested objects
 * Useful for nested structures like { user: { name, email, ... } }
 * @param data - The input data object
 * @param fieldWhitelist - Object mapping field names to their allowed sub-fields
 * @returns Object with whitelisted fields and nested fields
 */
export function whitelistNestedFields<
  T extends Record<string, unknown>
>(data: T, fieldWhitelist: Record<string, string[]>): Partial<T> {
  const result: Partial<T> = {};

  for (const [field, allowedSubFields] of Object.entries(fieldWhitelist)) {
    if (field in data && data[field] !== undefined) {
      const fieldValue = data[field];

      if (
        typeof fieldValue === "object" &&
        fieldValue !== null &&
        !Array.isArray(fieldValue)
      ) {
        // Nested object - whitelist its fields
        result[field] = whitelistFields(
          fieldValue as Record<string, unknown>,
          allowedSubFields
        ) as T[Extract<keyof T, string>];
      } else {
        // Simple value - include if in whitelist
        if (allowedSubFields.includes(field)) {
          result[field] = fieldValue;
        }
      }
    }
  }

  return result;
}

/**
 * Create a whitelist function for a specific set of fields
 * Useful for creating reusable whitelist functions for specific models
 * @param allowedFields - Array of field names that are allowed
 * @returns A function that whitelists fields from any object
 */
export function createWhitelistFunction<T extends Record<string, unknown>>(
  allowedFields: (keyof T)[]
) {
  return (data: T): Partial<T> => {
    return whitelistFields(data, allowedFields);
  };
}

/**
 * Whitelist array of objects
 * @param dataArray - Array of objects to whitelist
 * @param allowedFields - Array of field names that are allowed
 * @returns Array of objects with only whitelisted fields
 */
export function whitelistArrayFields<
  T extends Record<string, unknown>
>(
  dataArray: T[],
  allowedFields: (keyof T)[]
): Array<Partial<T>> {
  return dataArray.map((item) => whitelistFields(item, allowedFields));
}

/**
 * Remove fields that are not in the whitelist (mutates the object)
 * Use with caution - prefer whitelistFields which creates a new object
 * @param data - The data object to filter (will be mutated)
 * @param allowedFields - Array of field names that are allowed
 */
export function filterFieldsInPlace<T extends Record<string, unknown>>(
  data: T,
  allowedFields: (keyof T)[]
): void {
  const fieldsToRemove: (keyof T)[] = [];

  for (const field in data) {
    if (!allowedFields.includes(field)) {
      fieldsToRemove.push(field);
    }
  }

  for (const field of fieldsToRemove) {
    delete data[field];
  }
}

/**
 * Check if an object contains any fields not in the whitelist
 * Useful for validation/logging
 * @param data - The data object to check
 * @param allowedFields - Array of field names that are allowed
 * @returns Array of field names that are not whitelisted
 */
export function getNonWhitelistedFields<T extends Record<string, unknown>>(
  data: T,
  allowedFields: (keyof T)[]
): (keyof T)[] {
  const nonWhitelisted: (keyof T)[] = [];

  for (const field in data) {
    if (!allowedFields.includes(field)) {
      nonWhitelisted.push(field);
    }
  }

  return nonWhitelisted;
}

/**
 * Whitelist with default values for missing fields
 * @param data - The input data object
 * @param allowedFields - Array of field names that are allowed
 * @param defaults - Default values for fields
 * @returns Object with whitelisted fields and defaults applied
 */
export function whitelistWithDefaults<
  T extends Record<string, unknown>,
  D extends Partial<T>
>(data: T, allowedFields: (keyof T)[], defaults: D): Partial<T> & D {
  const whitelisted = whitelistFields(data, allowedFields);

  return {
    ...defaults,
    ...whitelisted,
  };
}

