/**
 * System Configuration
 */

import { SYSTEM_TIMEZONE } from "../../shared/constants";

export const SYSTEM_CONFIG = {
  /**
   * Timezone for scheduled tasks
   * Uses SYSTEM_TIMEZONE from shared constants
   */
  timezone: SYSTEM_TIMEZONE,
} as const;
