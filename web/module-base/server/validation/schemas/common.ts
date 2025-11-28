import * as v from "valibot";

/**
 * UUID v7 validator (strict, v7 only)
 */
export const uuidV7Schema = v.pipe(
  v.string(),
  v.regex(
    /^[0-9a-f]{8}-[0-9a-f]{4}-7[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i,
    "Invalid UUID format"
  )
);

/**
 * Standard UUID validator (any version 1-7)
 * This is the default UUID schema that accepts any valid UUID version
 */
export const uuidSchema = v.pipe(
  v.string(),
  v.regex(
    /^[0-9a-f]{8}-[0-9a-f]{4}-[1-7][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i,
    "Invalid UUID format"
  )
);

/**
 * Standard UUID validator (any version) - alias for uuidSchema
 * @deprecated Use uuidSchema instead. This alias is kept for backward compatibility.
 */
export const uuidAnySchema = uuidSchema;

/**
 * Email validator
 */
export const emailSchema = v.pipe(
  v.string(),
  v.minLength(1, "Email is required"),
  v.maxLength(255, "Email must be at most 255 characters"),
  v.email("Invalid email format")
);

/**
 * Phone number validator (basic)
 */
export const phoneSchema = v.pipe(
  v.string(),
  v.minLength(1, "Phone is required"),
  v.maxLength(20, "Phone must be at most 20 characters"),
  v.regex(
    /^[+]?[(]?[0-9]{1,4}[)]?[-\s.]?[(]?[0-9]{1,4}[)]?[-\s.]?[0-9]{1,9}$/,
    "Invalid phone format"
  )
);

/**
 * Username validator
 */
export const usernameSchema = v.pipe(
  v.string(),
  v.minLength(3, "Username must be at least 3 characters"),
  v.maxLength(50, "Username must be at most 50 characters"),
  v.regex(
    /^[a-zA-Z0-9_-]+$/,
    "Username can only contain letters, numbers, underscores, and hyphens"
  )
);

/**
 * String length validator factory
 */
export function stringLengthSchema(
  min: number,
  max: number,
  fieldName: string = "Field"
) {
  return v.pipe(
    v.string(),
    v.minLength(min, `${fieldName} must be at least ${min} characters`),
    v.maxLength(max, `${fieldName} must be at most ${max} characters`)
  );
}

/**
 * Optional string length validator factory
 */
export function optionalStringLengthSchema(
  min: number,
  max: number,
  fieldName: string = "Field"
) {
  return v.optional(
    v.pipe(
      v.string(),
      v.minLength(min, `${fieldName} must be at least ${min} characters`),
      v.maxLength(max, `${fieldName} must be at most ${max} characters`)
    )
  );
}

/**
 * Non-empty string validator
 */
export const nonEmptyStringSchema = v.pipe(
  v.string(),
  v.minLength(1, "Field cannot be empty")
);

/**
 * Trimmed string validator (automatically trims whitespace)
 */
export function trimmedStringSchema(
  min: number = 1,
  max: number = 255,
  fieldName: string = "Field"
) {
  return v.pipe(
    v.string(),
    v.transform((input) => input.trim()),
    v.minLength(min, `${fieldName} must be at least ${min} characters`),
    v.maxLength(max, `${fieldName} must be at most ${max} characters`)
  );
}

/**
 * Optional trimmed string validator
 */
export function optionalTrimmedStringSchema(
  min: number = 1,
  max: number = 255,
  fieldName: string = "Field"
) {
  return v.optional(
    v.pipe(
      v.string(),
      v.transform((input) => input.trim()),
      v.minLength(min, `${fieldName} must be at least ${min} characters`),
      v.maxLength(max, `${fieldName} must be at most ${max} characters`)
    )
  );
}

/**
 * Positive integer validator
 */
export const positiveIntegerSchema = v.pipe(
  v.number(),
  v.integer("Must be an integer"),
  v.minValue(1, "Must be a positive number")
);

/**
 * Non-negative integer validator
 */
export const nonNegativeIntegerSchema = v.pipe(
  v.number(),
  v.integer("Must be an integer"),
  v.minValue(0, "Must be a non-negative number")
);

/**
 * URL validator
 */
export const urlSchema = v.pipe(v.string(), v.url("Invalid URL format"));

/**
 * ISO date string validator
 */
export const isoDateSchema = v.pipe(
  v.string(),
  v.regex(
    /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d{3})?Z?$/,
    "Invalid ISO date format"
  )
);

/**
 * Array with minimum length validator factory
 */
export function arrayMinLengthSchema<
  T extends v.BaseSchema<unknown, unknown, v.BaseIssue<unknown>>,
>(itemSchema: T, minLength: number = 1, fieldName: string = "Array") {
  return v.pipe(
    v.array(itemSchema),
    v.minLength(
      minLength,
      `${fieldName} must have at least ${minLength} item(s)`
    )
  );
}

/**
 * Array with maximum length validator factory
 */
export function arrayMaxLengthSchema<
  T extends v.BaseSchema<unknown, unknown, v.BaseIssue<unknown>>,
>(itemSchema: T, maxLength: number, fieldName: string = "Array") {
  return v.pipe(
    v.array(itemSchema),
    v.maxLength(
      maxLength,
      `${fieldName} must have at most ${maxLength} item(s)`
    )
  );
}

/**
 * Array with length range validator factory
 */
export function arrayLengthSchema<
  T extends v.BaseSchema<unknown, unknown, v.BaseIssue<unknown>>,
>(
  itemSchema: T,
  minLength: number,
  maxLength: number,
  fieldName: string = "Array"
) {
  return v.pipe(
    v.array(itemSchema),
    v.minLength(
      minLength,
      `${fieldName} must have at least ${minLength} item(s)`
    ),
    v.maxLength(
      maxLength,
      `${fieldName} must have at most ${maxLength} item(s)`
    )
  );
}
