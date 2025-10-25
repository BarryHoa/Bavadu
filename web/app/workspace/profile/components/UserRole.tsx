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
      className="absolute top-3 right-3"
      color={color}
      size="sm"
      variant="flat"
    >
      {role}
    </Chip>
  );
}
