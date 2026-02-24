import { ChevronDown, ChevronUp, ChevronsUpDown } from "lucide-react";

export const sortIcons = {
  default: <ChevronsUpDown aria-hidden className="h-3.5 w-3.5 opacity-70" />,
  ascending: <ChevronUp aria-hidden className="h-3.5 w-3.5 opacity-90" />,
  descending: <ChevronDown aria-hidden className="h-3.5 w-3.5 opacity-90" />,
} as const;

export const alignClassMap = {
  end: "justify-end",
  center: "justify-center",
  start: "justify-start",
} as const;
