"use client";

import { IconButton } from "@heroui/button";
import { StarIcon, StarOutlineIcon } from "@heroui/icons";

interface FavoriteFilterProps {
  isActive: boolean;
  onToggle: () => void;
}

export default function FavoriteFilter({
  isActive,
  onToggle,
}: FavoriteFilterProps) {
  return (
    <IconButton
      variant={isActive ? "solid" : "bordered"}
      color={isActive ? "warning" : "default"}
      aria-label="Show favorites"
      onClick={onToggle}
      title="Show favorites"
    >
      {isActive ? <StarIcon /> : <StarOutlineIcon />}
    </IconButton>
  );
}
