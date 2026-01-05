"use client";
import { Star } from "lucide-react";

import { IBaseButton } from "@base/client/components";

interface FavoriteFilterProps {
  isActive: boolean;
  onToggle: () => void;
}

export default function FavoriteFilter({
  isActive,
  onToggle,
}: FavoriteFilterProps) {
  return (
    <IBaseButton
      aria-label="Show favorites"
      color={isActive ? "warning" : "default"}
      title="Show favorites"
      variant={isActive ? "solid" : "bordered"}
      onPress={onToggle}
    >
      <Star className={isActive ? "fill-current" : ""} />
    </IBaseButton>
  );
}
