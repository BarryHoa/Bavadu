import type { TabsSize, TabsVariant } from "./types";

export const SIZE_CLASS_MAP: Record<TabsSize, string> = {
  sm: "text-sm px-2 py-1.5 min-h-8",
  md: "text-sm px-3 py-2 min-h-10",
  lg: "text-base px-4 py-2.5 min-h-12",
};

export const VARIANT_CLASS_MAP: Record<TabsVariant, string> = {
  bordered:
    "border-b-2 border-transparent data-[selected=true]:border-primary data-[selected=true]:text-primary",
  underlined:
    "border-b-2 border-transparent data-[selected=true]:border-primary data-[selected=true]:text-primary",
  solid:
    "data-[selected=true]:bg-primary data-[selected=true]:text-primary-contrast rounded-t",
  light:
    "data-[selected=true]:bg-primary/10 data-[selected=true]:text-primary rounded-t",
};
