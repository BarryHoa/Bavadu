"use client";
import { IBaseInputSearch } from "@base/client/components";

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
    <IBaseInputSearch
      className="min-w-[180px]"
      placeholder={placeholder}
      value={value}
      onValueChange={onChange}
    />
  );
}
