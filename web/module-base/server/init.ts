/**
 * Server initialization file
 * Import this file in any server-side code to ensure models are loaded
 * 
 * Usage:
 * - Import in app/layout.tsx (server component)
 * - Import in any API route
 * - Import in middleware.ts
 */

// Auto-load models when this file is imported
import "./controllers/AutoLoadModel";

// Re-export commonly used items
export { default as modelSystemStore } from "./models/ModelSystemStore";
export { ModelSystemStore } from "./models/ModelSystemStore";
export { BaseModel } from "./models/BaseModel";

