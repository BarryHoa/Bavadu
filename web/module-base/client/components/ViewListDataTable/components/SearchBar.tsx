"use client";

import { memo } from "react";

import { IBaseInputSearch } from "@base/client/components";

interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

function SearchBar({
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

export default memo(SearchBar);
