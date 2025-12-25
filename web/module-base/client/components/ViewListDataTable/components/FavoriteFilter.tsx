"use client";
import { IBaseButton } from "@base/client/components";

import { Star } from "lucide-react";

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
