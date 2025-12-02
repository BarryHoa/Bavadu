"use client";

import type {
  DropdownOptionsParams,
  DropdownOptionsResponse,
} from "@base/client/services/DropdownOptionsService";
import { dropdownOptionsService } from "@base/client/services/DropdownOptionsService";
import { SelectItem } from "@heroui/select";
import { useInfiniteQuery } from "@tanstack/react-query";
import { useTranslations } from "next-intl";
import React, {
  useCallback,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
} from "react";
import IBaseInputSearch from "../IBaseInputSearch";
import IBaseSelect, { IBaseSelectProps } from "./IBaseSelect";
import type { SelectItemOption } from "./IBaseSingleSelect";

export interface FetchOptionsParams extends DropdownOptionsParams {}

export type FetchOptionsFn = (
  params: FetchOptionsParams
) => Promise<DropdownOptionsResponse>;

export interface IBaseSingleSelectAsyncProps
  extends Omit<
    IBaseSelectProps,
    "children" | "selectionMode" | "onSelectionChange" | "selectedKeys"
  > {
  selectedKey?: string;
  onSelectionChange?: (key?: string, item?: SelectItemOption) => void;
  // Either provide a fetch function or a model string
  fetchOptions?: FetchOptionsFn;
  model?: string;
  searchPlaceholder?: string;
  defaultLimit?: number;
  // Additional params to pass to fetch function
  defaultParams?: Omit<FetchOptionsParams, "limit" | "offset" | "search">;
}

const IBaseSingleSelectAsync = React.forwardRef<
  HTMLSelectElement,
  IBaseSingleSelectAsyncProps
>((props, ref) => {
  const {
    fetchOptions,
    model,
    selectedKey,
    onSelectionChange,
    searchPlaceholder,
    defaultLimit = 20,
    defaultParams = {},
    ...rest
  } = props;
  const componentKeyId = useId();

  const tSelectAsync = useTranslations("components.selectAsync");

  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const searchDebounceRef = useRef<NodeJS.Timeout | null>(null);

  // Memoize fetch function to avoid recreating on every render
  const fetchFn = useMemo(() => {
    if (fetchOptions) {
      return fetchOptions;
    }
    if (model) {
      return async (params: FetchOptionsParams) => {
        return dropdownOptionsService.getOptionsDropdown(model, params);
      };
    }
    return null;
  }, [fetchOptions, model]);

  // Memoize defaultParams to prevent unnecessary query key changes
  const stableDefaultParams = useMemo(
    () => defaultParams,
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [JSON.stringify(defaultParams)]
  );

  // Debounce search term to avoid excessive API calls
  useEffect(() => {
    if (searchDebounceRef.current) {
      clearTimeout(searchDebounceRef.current);
    }

    searchDebounceRef.current = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 300);

    return () => {
      if (searchDebounceRef.current) {
        clearTimeout(searchDebounceRef.current);
      }
    };
  }, [searchTerm]);

  // Memoize query function to prevent recreation
  const queryFn = useCallback(
    async ({ pageParam = 0 }: { pageParam?: number }) => {
      if (!fetchFn) {
        throw new Error("Either fetchOptions or model must be provided");
      }
      return fetchFn({
        offset: pageParam,
        limit: defaultLimit,
        search: debouncedSearchTerm || undefined,
        ...stableDefaultParams,
      });
    },
    [fetchFn, defaultLimit, debouncedSearchTerm, stableDefaultParams]
  );

  // Memoize getNextPageParam to prevent recreation
  const getNextPageParam = useCallback(
    (
      lastPage: DropdownOptionsResponse,
      allPages: DropdownOptionsResponse[]
    ) => {
      const currentTotal = lastPage.total || 0;
      // Calculate current offset: sum of all items loaded so far
      const currentOffset = allPages.reduce(
        (sum, page) => sum + (page.data?.length || 0),
        0
      );
      // If current offset is less than total, return next offset
      if (currentOffset < currentTotal) {
        return currentOffset;
      }
      // No more pages
      return undefined;
    },
    []
  );

  // Memoize query key to prevent unnecessary refetches
  const queryKey = useMemo(
    () => [
      "singleSelectAsync",
      model || componentKeyId,
      debouncedSearchTerm,
      defaultLimit,
      stableDefaultParams,
    ],
    [model, debouncedSearchTerm, defaultLimit, stableDefaultParams]
  );

  // Fetch data using useInfiniteQuery
  const {
    data,
    isLoading,
    isFetching,
    error,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useInfiniteQuery({
    queryKey,
    queryFn,
    enabled: !!fetchFn && isOpen,
    initialPageParam: 0,
    getNextPageParam,
    staleTime: 30000, // Cache for 30 seconds
  });

  // Flatten all pages into a single array of items
  const allItems = useMemo(() => {
    if (!data?.pages) return [];
    return data.pages.flatMap((page) =>
      page.data.map((item) => ({
        ...item,
        value: item.value,
        label: item.label,
      }))
    );
  }, [data?.pages]);

  // Get total from last page
  const total = useMemo(() => {
    if (!data?.pages || data.pages.length === 0) return 0;
    return data.pages[data.pages.length - 1].total || 0;
  }, [data?.pages]);

  // Handle scroll for infinite loading - memoized to prevent recreation
  const handleScroll = useCallback(
    (e: React.UIEvent<HTMLUListElement>) => {
      const target = e.currentTarget;
      const scrollTop = target.scrollTop;
      const scrollHeight = target.scrollHeight;
      const clientHeight = target.clientHeight;

      // Load more when scrolled near bottom (within 50px)
      if (
        scrollHeight - scrollTop - clientHeight < 50 &&
        hasNextPage &&
        !isFetchingNextPage &&
        !isLoading &&
        !isFetching
      ) {
        fetchNextPage();
      }
    },
    [hasNextPage, isFetchingNextPage, isLoading, isFetching, fetchNextPage]
  );

  // Focus search input when dropdown opens
  useEffect(() => {
    if (!isOpen) {
      setSearchTerm("");
      setDebouncedSearchTerm("");
    } else if (isOpen && searchInputRef.current) {
      setTimeout(() => {
        searchInputRef.current?.focus();
      }, 100);
    }
  }, [isOpen]);

  const handleOpenChange = useCallback(
    (open: boolean) => {
      if (rest.isDisabled) {
        setIsOpen(false);
        return;
      }

      setIsOpen(open);
      if (rest.onOpenChange) {
        rest.onOpenChange(open);
      }
    },
    [rest.isDisabled, rest.onOpenChange, setIsOpen]
  );

  // Memoize selection change handler to prevent recreation
  const handleSelectionChange = useCallback(
    (
      keys: Parameters<NonNullable<IBaseSelectProps["onSelectionChange"]>>[0]
    ) => {
      if (typeof keys === "string") return;
      const keySet = keys as Set<string>;
      const selected = Array.from(keySet)[0] as string | undefined;

      if (selected === "__search__") {
        return;
      }

      if (!onSelectionChange) return;

      // Handle clearing selection
      if (!selected || keySet.size === 0) {
        const emptyItem: SelectItemOption = { value: "", label: "" };
        onSelectionChange("", emptyItem);
        return;
      }

      // Find the selected item
      const selectedItem = allItems.find((item) => item.value === selected);
      if (selectedItem) {
        onSelectionChange(selected, selectedItem);
      }
    },
    [allItems, onSelectionChange]
  );

  // Memoize loading state
  const isLoadingData = useMemo(
    () => isLoading || isFetching,
    [isLoading, isFetching]
  );

  // Memoize selectedKeys to prevent creating new Set on every render
  const selectedKeysSet = useMemo(
    () => (selectedKey ? new Set([selectedKey]) : undefined),
    [selectedKey]
  );

  // Memoize listboxProps to prevent object recreation
  const listboxPropsMemo = useMemo(
    () => ({
      onScroll: handleScroll,
      ...rest.listboxProps,
    }),
    [handleScroll, rest.listboxProps]
  );

  // Memoize search input classNames
  const searchInputClassNames = useMemo(
    () => ({
      base: "w-full",
      input: "text-sm",
    }),
    []
  );

  // Memoize search input keydown handler
  const handleSearchKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === "Enter") {
        e.preventDefault();
      }
      if (e.key === "Escape") {
        e.preventDefault();
        setSearchTerm("");
      }
    },
    []
  );

  return (
    <IBaseSelect
      {...rest}
      ref={ref}
      selectionMode="single"
      selectedKeys={selectedKeysSet}
      onSelectionChange={handleSelectionChange}
      onOpenChange={handleOpenChange}
      classNames={rest.classNames}
      items={allItems}
      isOpen={isOpen}
      listboxProps={listboxPropsMemo}
    >
      <>
        <SelectItem
          key="__search__"
          textValue={tSelectAsync("searchLabel")}
          className="sticky top-0 z-100 pointer-events-auto data-[hover=true]:bg-content1 bg-content1 border-default-200 p-0 py-1"
          isReadOnly
          hideSelectedIcon
        >
          <IBaseInputSearch
            ref={searchInputRef}
            value={searchTerm}
            onValueChange={setSearchTerm}
            size="sm"
            placeholder={searchPlaceholder}
            autoFocus={isOpen}
            classNames={searchInputClassNames}
            onKeyDown={handleSearchKeyDown}
            showClearButton={false}
          />
        </SelectItem>

        {error && (
          <SelectItem
            key="__error__"
            textValue={tSelectAsync("error")}
            isReadOnly
            hideSelectedIcon
            className="text-danger"
          >
            {tSelectAsync("error")}
          </SelectItem>
        )}

        {isLoadingData && allItems.length === 0 && (
          <SelectItem
            key="__loading__"
            textValue={tSelectAsync("loading")}
            isReadOnly
            hideSelectedIcon
          >
            {tSelectAsync("loading")}
          </SelectItem>
        )}

        {allItems.length === 0 && !isLoadingData && !error && (
          <SelectItem
            key="__empty__"
            textValue={tSelectAsync("noResults")}
            isReadOnly
            hideSelectedIcon
          >
            {tSelectAsync("noResults")}
          </SelectItem>
        )}

        {allItems.map((item) => (
          <SelectItem key={item.value} textValue={item.label}>
            {item.label}
          </SelectItem>
        ))}

        {isFetchingNextPage && (
          <SelectItem
            key="__loading_more__"
            textValue={tSelectAsync("loadingMore")}
            isReadOnly
            hideSelectedIcon
          >
            {tSelectAsync("loadingMore")}
          </SelectItem>
        )}
      </>
    </IBaseSelect>
  );
});

IBaseSingleSelectAsync.displayName = "IBaseSingleSelectAsync";

export default IBaseSingleSelectAsync;
