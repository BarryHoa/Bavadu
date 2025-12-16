"use client";

import { SelectItem } from "@heroui/select";
import MiniSearch from "minisearch";
import React, { useEffect, useMemo, useRef, useState } from "react";

import { useLocalizedText } from "../../hooks/useLocalizedText";
import { LocalizeText } from "../../interface/LocalizeText";
import IBaseInputSearch from "../IBaseInputSearch";

import IBaseSelect, { IBaseSelectProps } from "./IBaseSelect";

export interface SelectItemOption extends Record<string, unknown> {
  value: string | number;
  label: string | LocalizeText;
  localizedLabel?: string;
  searchText?: string; // Optional additional text for search
  [key: string]: unknown;
}

interface IBaseSingleSelectProps extends Omit<
  IBaseSelectProps,
  "children" | "selectionMode" | "onSelectionChange" | "selectedKeys"
> {
  selectedKey?: string;
  onSelectionChange?: (key?: string, item?: SelectItemOption) => void;
  onRenderOption?: (item: SelectItemOption) => React.ReactNode;
  items?: SelectItemOption[];
  searchPlaceholder?: string;
  searchShowMaxResults?: number;
  searchRules?: {
    by?: "label" | "searchText";
    prefix?: boolean;
    fuzzy?: number;
  }[];
}

const IBaseSingleSelect = React.forwardRef<
  HTMLSelectElement,
  IBaseSingleSelectProps
>((props, ref) => {
  const {
    items,
    selectedKey,
    onSelectionChange,
    searchPlaceholder = "Search...",
    searchRules = [{ by: "label", prefix: true, fuzzy: 0.2 }],
    searchShowMaxResults = 10,
    onRenderOption,
    ...rest
  } = props;
  const [searchTerm, setSearchTerm] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const localizedText = useLocalizedText();
  // Create MiniSearch index for items with phrase support
  const miniSearch = useMemo(() => {
    if (!items || items.length === 0) {
      return null;
    }

    // Filter out items with invalid values and ensure value is a string
    const validItems = items.filter(
      (item) =>
        item.value !== undefined && item.value !== null && item.value !== "",
    );

    if (validItems.length === 0) {
      return null;
    }

    const searchableItems = validItems.map((item) => ({
      id: String(item.value),
      label: String(item.label || ""),
      searchText: String(item.searchText || item.label || ""),
      // Add full phrase for exact matching
      fullPhrase:
        `${item.label || ""} ${item.searchText || item.label || ""}`.toLowerCase(),
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
          result.fullPhrase?.includes(cleanTerm),
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
          result.fullPhrase?.includes(cleanTerm),
        );

        // Combine: phrase matches first, then word matches
        const otherResults = results.filter(
          (result) => !phraseResults.some((pr) => pr.id === result.id),
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

    return items.filter((item) => resultMap.has(String(item.value)));
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
    // Prevent opening if disabled

    if (rest.isDisabled) {
      setIsOpen(false);

      return;
    }

    setIsOpen(open);
    if (rest.onOpenChange) {
      rest.onOpenChange(open);
    }
  };

  const handleSelectionChange = (
    keys: Parameters<NonNullable<IBaseSelectProps["onSelectionChange"]>>[0],
  ) => {
    // Prevent selection of the search input item
    if (typeof keys === "string") return;
    const keySet = keys as Set<string>;
    const selected = Array.from(keySet)[0] as string | undefined;

    if (selected === "__search__") {
      return;
    }

    if (!onSelectionChange) return;

    // Handle clearing selection (empty set)
    if (!selected || keySet.size === 0) {
      // Find a placeholder item or use empty string
      // For clearing, we'll pass empty string and a minimal item
      const emptyItem: SelectItemOption = { value: "", label: "" };

      onSelectionChange("", emptyItem);

      return;
    }

    // Find the selected item
    const selectedItem = items?.find((item) => item.value === selected);

    if (selectedItem) {
      onSelectionChange(selected, selectedItem);
    }
  };

  return (
    <IBaseSelect
      {...rest}
      ref={ref}
      classNames={rest.classNames}
      isOpen={isOpen}
      items={filteredItems}
      selectedKeys={selectedKey ? new Set([selectedKey]) : undefined}
      selectionMode="single"
      onOpenChange={handleOpenChange}
      onSelectionChange={handleSelectionChange}
    >
      <>
        {items && items.length > searchShowMaxResults && (
          <SelectItem
            key="__search__"
            hideSelectedIcon
            isReadOnly
            className="sticky top-0 z-100 pointer-events-auto data-[hover=true]:bg-content1 bg-content1  border-default-200 p-0 py-1"
            textValue="Search"
          >
            <IBaseInputSearch
              ref={searchInputRef}
              // Avoid autoFocus for better accessibility; focus is managed via effect
              classNames={{
                base: "w-full",
                input: "text-sm",
              }}
              placeholder={searchPlaceholder}
              showClearButton={false}
              size="sm"
              value={searchTerm}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                }
                if (e.key === "Escape") {
                  e.preventDefault();
                  setSearchTerm("");
                }
              }}
              onValueChange={setSearchTerm}
            />
          </SelectItem>
        )}

        {filteredItems.map((item) => {
          const localizedLabel = localizedText(item.label);

          return (
            <SelectItem key={item.value} textValue={localizedLabel}>
              {onRenderOption
                ? onRenderOption({
                    ...item,
                    localizedLabel,
                  })
                : localizedLabel}
            </SelectItem>
          );
        })}
      </>
    </IBaseSelect>
  );
});

IBaseSingleSelect.displayName = "IBaseSingleSelect";

export default IBaseSingleSelect;
