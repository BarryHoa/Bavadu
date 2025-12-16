"use client";

import type {
  DropdownOptionsParams,
  DropdownOptionsResponse,
} from "@base/client/services/DropdownOptionsService";
import type { SelectItemOption } from "./IBaseSingleSelect";

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

import { useLocalizedText } from "../../hooks/useLocalizedText";
import IBaseInputSearch from "../IBaseInputSearch";

import IBaseSelect, { IBaseSelectProps } from "./IBaseSelect";

export interface FetchOptionsParams extends DropdownOptionsParams {}

export type ServiceFetch = (
  params: FetchOptionsParams
) => Promise<DropdownOptionsResponse>;

export interface IBaseSingleSelectAsyncProps extends Omit<
  IBaseSelectProps,
  "children" | "selectionMode" | "onSelectionChange" | "selectedKeys"
> {
  selectedKey?: string;
  onRenderOption?: (item: SelectItemOption) => React.ReactNode;
  onSelectionChange?: (key?: string, item?: SelectItemOption) => void;
  // Either provide a fetch function or a model string
  model?: string;
  serviceFn?: ServiceFetch;
  callWhen?: "open" | "mount";
  onTheFirstFetchSuccess?: (data: DropdownOptionsResponse) => void;
  onFinishFetch?: (data: DropdownOptionsResponse) => void;
  onErrorFetch?: (error: Error) => void;
  onFetching?: (isFetching: boolean) => void;
  searchPlaceholder?: string;
  defaultLimit?: number;
  isShowSearch?: boolean;
  // Additional params to pass to fetch function
  defaultParams?: Omit<FetchOptionsParams, "limit" | "offset" | "search">;
}

const IBaseSingleSelectAsync = React.forwardRef<
  HTMLSelectElement,
  IBaseSingleSelectAsyncProps
>((props, ref) => {
  const {
    serviceFn,
    model,
    callWhen = "open",
    selectedKey,
    onSelectionChange,
    onTheFirstFetchSuccess,
    onFinishFetch,
    onErrorFetch,
    onFetching,
    searchPlaceholder,
    defaultLimit = 20,
    defaultParams = {},
    isShowSearch = true,
    onRenderOption,
    ...rest
  } = props;
  const componentKeyId = useId();

  const localizedText = useLocalizedText();

  const tSelectAsync = useTranslations("components.selectAsync");

  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const searchDebounceRef = useRef<NodeJS.Timeout | null>(null);
  const isFirstFetchRef = useRef(true);
  // Memoize fetch function to avoid recreating on every render
  const fetchFn = useMemo(() => {
    if (serviceFn) {
      return serviceFn;
    }
    if (model) {
      return async (params: FetchOptionsParams) => {
        return dropdownOptionsService.getOptionsDropdown(model, params);
      };
    }

    return null;
  }, [serviceFn, model]);

  // Memoize defaultParams to prevent unnecessary query key changes
  const stableDefaultParams = useMemo(() => defaultParams, [defaultParams]);

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
      onFetching?.(true);

      const data = await fetchFn({
        offset: pageParam,
        limit: defaultLimit,
        search: debouncedSearchTerm || undefined,
        ...stableDefaultParams,
      })
        .then((data) => {
          if (isFirstFetchRef.current) {
            onTheFirstFetchSuccess?.(data);
            isFirstFetchRef.current = false;
          }
          onFinishFetch?.(data);

          return data;
        })
        .catch((error) => {
          onErrorFetch?.(error);

          return {
            data: [],
            total: 0,
          };
        })
        .finally(() => {
          onFetching?.(false);
        });

      return data;
    },
    [
      fetchFn,
      defaultLimit,
      debouncedSearchTerm,
      stableDefaultParams,
      onTheFirstFetchSuccess,
      onFetching,
      onFinishFetch,
    ]
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
    enabled: !!fetchFn && (callWhen === "open" ? isOpen : true),
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

  // // Get total from last page
  // const total = useMemo(() => {
  //   if (!data?.pages || data.pages.length === 0) return 0;
  //   return data.pages[data.pages.length - 1].total || 0;
  // }, [data?.pages]);

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
    } else if (isOpen && isShowSearch && searchInputRef.current) {
      setTimeout(() => {
        searchInputRef.current?.focus();
      }, 100);
    }
  }, [isOpen, isShowSearch]);

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
      classNames={rest.classNames}
      isOpen={isOpen}
      items={allItems}
      listboxProps={listboxPropsMemo}
      selectedKeys={selectedKeysSet}
      selectionMode="single"
      onOpenChange={handleOpenChange}
      onSelectionChange={handleSelectionChange}
    >
      <>
        {isShowSearch && (
          <SelectItem
            key="__search__"
            hideSelectedIcon
            isReadOnly
            className="sticky top-0 z-100 pointer-events-auto data-[hover=true]:bg-content1 bg-content1 border-default-200 p-0 py-1"
            textValue={tSelectAsync("searchLabel")}
          >
            <IBaseInputSearch
              ref={searchInputRef}
              // Avoid autoFocus for better accessibility; focus is handled via effect
              classNames={searchInputClassNames}
              placeholder={searchPlaceholder}
              showClearButton={false}
              size="sm"
              value={searchTerm}
              onKeyDown={handleSearchKeyDown}
              onValueChange={setSearchTerm}
            />
          </SelectItem>
        )}

        {error && (
          <SelectItem
            key="__error__"
            hideSelectedIcon
            isReadOnly
            className="text-danger"
            textValue={tSelectAsync("error")}
          >
            {tSelectAsync("error")}
          </SelectItem>
        )}

        {isLoadingData && allItems.length === 0 && (
          <SelectItem
            key="__loading__"
            hideSelectedIcon
            isReadOnly
            textValue={tSelectAsync("loading")}
          >
            {tSelectAsync("loading")}
          </SelectItem>
        )}

        {allItems.length === 0 && !isLoadingData && !error && (
          <SelectItem
            key="__empty__"
            hideSelectedIcon
            isReadOnly
            textValue={tSelectAsync("noResults")}
          >
            {tSelectAsync("noResults")}
          </SelectItem>
        )}

        {allItems.map((item) => {
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

        {isFetchingNextPage && (
          <SelectItem
            key="__loading_more__"
            hideSelectedIcon
            isReadOnly
            textValue={tSelectAsync("loadingMore")}
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
