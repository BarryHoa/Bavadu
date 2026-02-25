"use client";

import { debounce } from "lodash";
import { memo, useState } from "react";

import { IBaseInputSearch } from "@base/client/components";

interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}

function SearchBar({
  value,
  onChange,
  placeholder = "Search",
  className,
}: SearchBarProps) {
  const [search, setSearch] = useState(value);

  const onValueChange = (value: string) => {
    setSearch(value);
    // debounce
    debounce(() => {
      onChange(value);
    }, 500);
  };

  return (
    <IBaseInputSearch
      className={[className].filter(Boolean).join(" ")}
      placeholder={placeholder}
      value={search}
      onValueChange={onValueChange}
    />
  );
}

export default memo(SearchBar);
