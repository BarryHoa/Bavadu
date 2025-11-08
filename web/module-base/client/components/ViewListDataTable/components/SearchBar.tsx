"use client";
import { Search } from "lucide-react";
import InputBase from "../../Input";

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
    <InputBase
      startContent={<Search size={16} className="text-default-400" />}
      placeholder={placeholder}
      value={value}
      onValueChange={onChange}
      className="min-w-[180px]"
    />
  );
}
