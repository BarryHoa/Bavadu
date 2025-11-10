import { Button } from "@heroui/button";
import {
  Dropdown,
  DropdownItem,
  DropdownMenu,
  DropdownTrigger,
} from "@heroui/dropdown";
import { Pagination } from "@heroui/pagination";
import type { Key, SVGProps } from "react";
import { useCallback, useMemo } from "react";

import { PAGINATION_PAGE_SIZE_OPTIONS } from "./paginationConsts";

export const ChevronIcon = (props: SVGProps<SVGSVGElement>) => {
  return (
    <svg
      aria-hidden="true"
      fill="none"
      focusable="false"
      height="1em"
      role="presentation"
      viewBox="0 0 24 24"
      width="1em"
      {...props}
    >
      <path
        d="M15.5 19l-7-7 7-7"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.5"
      />
    </svg>
  );
};

export default function PaginationComponent({
  pages,
  page,
  pageSize,
  onChange,
  onPageSizeChange,
}: {
  pages: number;
  page: number;
  pageSize: number;
  onChange: (page: number) => void;
  onPageSizeChange: (pageSize: number) => void;
}) {
  const selectedKeys = useMemo(() => new Set([String(pageSize)]), [pageSize]);

  const handlePageSizeChange = useCallback(
    (key: Key) => {
      const selectedValue = Number(key);

      if (!Number.isNaN(selectedValue)) {
        onPageSizeChange(selectedValue);
      }
    },
    [onPageSizeChange]
  );

  return (
    <div className="flex items-center gap-3">
      <Pagination
        disableCursorAnimation
        isCompact
        showControls
        size="sm"
        className="gap-3"
        classNames={{
          base: "items-center",
          wrapper: "gap-1",
          item: "w-8 h-8 text-small font-medium text-primary flex items-center justify-center rounded-full bg-transparent data-[hover=true]:bg-primary-50 data-[hover=true]:text-primary",
          next: "w-8 h-8 text-small text-default-500 flex items-center justify-center rounded-full border border-transparent data-[hover=true]:border-primary data-[hover=true]:text-primary",
          prev: "w-8 h-8 text-small text-default-500 flex items-center justify-center rounded-full border border-transparent data-[hover=true]:border-primary data-[hover=true]:text-primary",
          cursor:
            "w-8 h-8 text-small font-semibold text-primary flex items-center justify-center rounded-full border border-primary bg-primary-50 shadow-none",
        }}
        page={page}
        total={pages}
        onChange={onChange}
      />
      <Dropdown placement="top">
        <DropdownTrigger>
          <Button
            className="min-w-[90px] h-8 text-small font-medium"
            endContent={<ChevronIcon className="text-small rotate-90" />}
            size="sm"
            variant="bordered"
          >
            {pageSize} / page
          </Button>
        </DropdownTrigger>
        <DropdownMenu
          aria-label="Page size selection"
          className="min-w-[60px]"
          selectedKeys={selectedKeys}
          selectionMode="single"
          onSelectionChange={(keys) => {
            const [selectedKey] = Array.from(keys);

            if (selectedKey != null) {
              handlePageSizeChange(selectedKey);
            }
          }}
        >
          {PAGINATION_PAGE_SIZE_OPTIONS.map((item) => (
            <DropdownItem key={String(item)} textValue={String(item)}>
              {item}
            </DropdownItem>
          ))}
        </DropdownMenu>
      </Dropdown>
    </div>
  );
}
