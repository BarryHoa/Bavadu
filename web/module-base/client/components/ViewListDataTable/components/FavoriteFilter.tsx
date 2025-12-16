"use client";

import { Button } from "@heroui/button";
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
    <Button
      aria-label="Show favorites"
      color={isActive ? "warning" : "default"}
      title="Show favorites"
      variant={isActive ? "solid" : "bordered"}
      onPress={onToggle}
    >
      <Star className={isActive ? "fill-current" : ""} />
    </Button>
  );
}
