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
      variant={isActive ? "solid" : "bordered"}
      color={isActive ? "warning" : "default"}
      aria-label="Show favorites"
      onPress={onToggle}
      title="Show favorites"
    >
      <Star className={isActive ? "fill-current" : ""} />
    </Button>
  );
}
