"use client";

import { SelectItem } from "@heroui/select";
import MiniSearch from "minisearch";
import { useEffect, useMemo, useRef, useState } from "react";
import IBaseInput from "../IBaseInput";
import IBaseSelect, { IBaseSelectProps } from "./IBaseSelect";

export interface SelectItemOption extends Record<string, unknown> {
  value: string;
  label: string;
  searchText?: string; // Optional additional text for search
  [key: string]: unknown;
}

interface IBaseSelectWithSearchProps
  extends Omit<IBaseSelectProps, "children" | "selectionMode"> {
  items?: SelectItemOption[];
  searchPlaceholder?: string;
  searchShowMaxResults?: number;
  searchRules?: {
    by?: "label" | "searchText";
    prefix?: boolean;
    fuzzy?: number;
  }[];
}

const IBaseSelectWithSearch = (props: IBaseSelectWithSearchProps) => {
  const {
    items,
    searchPlaceholder = "Search...",
    searchRules = [{ by: "label", prefix: true, fuzzy: 0.2 }],
    searchShowMaxResults = 10,
    ...rest
  } = props;
  const [searchTerm, setSearchTerm] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Create MiniSearch index for items with phrase support
  const miniSearch = useMemo(() => {
    if (!items || items.length === 0) {
      return null;
    }

    const searchableItems = items.map((item) => ({
      id: item.value,
      label: item.label,
      searchText: item.searchText || item.label,
      // Add full phrase for exact matching
      fullPhrase:
        `${item.label} ${item.searchText || item.label}`.toLowerCase(),
    }));

    const ms = new MiniSearch<{
      id: string;
      label: string;
      searchText: string;
      fullPhrase: string;
    }>({
      fields: ["label", "searchText", "fullPhrase"],
      storeFields: ["id", "label", "searchText", "fullPhrase"],
      idField: "id",
    });

    ms.addAll(searchableItems);

    return ms;
  }, [items]);

  // Filter items using MiniSearch with phrase support
  const filteredItems = useMemo(() => {
    if (!items || items.length === 0) return [];

    const term = searchTerm.trim();
    if (!term || !miniSearch) return items;

    // Check if search term contains quotes (exact phrase)
    const isPhraseSearch = (term.match(/"/g) || []).length >= 2;
    const cleanTerm = term.replace(/"/g, "").trim().toLowerCase();

    let results;
    if (isPhraseSearch && cleanTerm) {
      // Exact phrase search - search for the entire phrase
      // First try exact match on fullPhrase field
      results = miniSearch.search(cleanTerm, {
        prefix: false,
        fuzzy: 0.1, // Lower fuzzy for exact phrases
        combineWith: "AND", // All words must be present
      });

      // Also filter by exact phrase match in fullPhrase
      if (results.length > 0) {
        results = results.filter((result) =>
          result.fullPhrase?.includes(cleanTerm)
        );
      }
    } else {
      // Regular search - can match individual words or phrases
      const words = cleanTerm.split(/\s+/).filter((w) => w.length > 0);

      if (words.length > 1) {
        // Multiple words - use AND to require all words (phrase search)
        results = miniSearch.search(cleanTerm, {
          prefix: true,
          fuzzy: 0.2,
          combineWith: "AND", // All words must match (phrase-like behavior)
        });

        // Boost results that contain the full phrase
        const phraseResults = results.filter((result) =>
          result.fullPhrase?.includes(cleanTerm)
        );

        // Combine: phrase matches first, then word matches
        const otherResults = results.filter(
          (result) => !phraseResults.some((pr) => pr.id === result.id)
        );
        results = [...phraseResults, ...otherResults];
      } else {
        // Single word - use prefix matching
        results = miniSearch.search(cleanTerm, {
          prefix: true,
          fuzzy: 0.2,
        });
      }
    }

    if (results.length === 0) return [];

    // Map results back to original items
    const resultMap = new Map(results.map((result) => [result.id, result]));

    return items.filter((item) => resultMap.has(item.value));
  }, [items, miniSearch, searchTerm]);

  // Focus search input when dropdown opens
  useEffect(() => {
    if (!isOpen) {
      setSearchTerm("");
    }
    if (isOpen && searchInputRef.current) {
      // Small delay to ensure the input is rendered in the DOM
      setTimeout(() => {
        searchInputRef.current?.focus();
      }, 100);
    }
  }, [isOpen]);

  const handleOpenChange = (open: boolean) => {
    setIsOpen(open);
    if (rest.onOpenChange) {
      rest.onOpenChange(open);
    }
  };

  const handleSelectionChange = (
    keys: Parameters<NonNullable<IBaseSelectProps["onSelectionChange"]>>[0]
  ) => {
    // Prevent selection of the search input item
    if (typeof keys === "string") return;
    const selected = Array.from(keys)[0] as string;
    if (selected === "__search__") {
      return;
    }
    // Call the original onSelectionChange if provided
    if (rest.onSelectionChange) {
      rest.onSelectionChange(keys as any);
    }
  };

  return (
    <IBaseSelect
      {...rest}
      selectionMode="single"
      onSelectionChange={handleSelectionChange}
      onOpenChange={handleOpenChange}
      classNames={rest.classNames}
      items={filteredItems}
    >
      <>
        {items && items.length > searchShowMaxResults && (
          <SelectItem
            key="__search__"
            textValue="Search"
            className="sticky top-0 z-100 pointer-events-auto data-[hover=true]:bg-content1 bg-content1  border-default-200 p-0 py-1"
            isReadOnly
            hideSelectedIcon
          >
            <IBaseInput
              ref={searchInputRef}
              value={searchTerm}
              onValueChange={setSearchTerm}
              size="sm"
              placeholder={searchPlaceholder}
              autoFocus={isOpen}
              classNames={{
                base: "w-full",
                input: "text-sm",
              }}
              startContent={
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <circle cx="11" cy="11" r="8" />
                  <path d="m21 21-4.35-4.35" />
                </svg>
              }
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                }
                if (e.key === "Escape") {
                  e.preventDefault();
                  setSearchTerm("");
                }
              }}
            />
          </SelectItem>
        )}

        {filteredItems.map((item) => (
          <SelectItem key={item.value} textValue={item.label}>
            {item.label}
          </SelectItem>
        ))}
      </>
    </IBaseSelect>
  );
};

export default IBaseSelectWithSearch;
