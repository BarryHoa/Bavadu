"use client";

import { Input } from "@heroui/input";
import { Search } from "lucide-react";

interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

export default function SearchBar({
  value,
  onChange,
  placeholder = "Search",
}: SearchBarProps) {
  return (
    <Input
      startContent={<Search size={16} className="text-default-400" />}
      placeholder={placeholder}
      value={value}
      onValueChange={onChange}
      className="min-w-[180px]"
    />
  );
}
