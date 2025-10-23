"use client";

import { Chip } from "@heroui/chip";

interface UserRoleProps {
  role?: string;
  color?: "primary" | "success" | "warning" | "danger" | "default";
}

export default function UserRole({
  role = "User",
  color = "primary",
}: UserRoleProps) {
  return (
    <Chip
      color={color}
      variant="flat"
      size="sm"
      className="absolute top-3 right-3"
    >
      {role}
    </Chip>
  );
}
