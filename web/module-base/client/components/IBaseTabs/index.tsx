/**
 * Re-exports IBaseTabsPrimary as IBaseTabs for backward compatibility.
 * Prefer importing IBaseTabsPrimary and IBaseTabPrimary from @base/client/components.
 */
export {
  IBaseTabsPrimary as IBaseTabs,
  IBaseTabPrimary as IBaseTab,
} from "../IBaseTabsPrimary";
export type { IBaseTabsPrimaryProps as IBaseTabsProps } from "../IBaseTabsPrimary/types";
export type { IBaseTabPrimaryProps } from "../IBaseTabsPrimary/types";

import IBaseTabsPrimary from "../IBaseTabsPrimary";
export default IBaseTabsPrimary;
