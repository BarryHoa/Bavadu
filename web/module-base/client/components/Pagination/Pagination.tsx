import { IBaseButton, IBaseDropdown, IBasePagination } from "@base/client/components";
import type { Key, SVGProps } from "react";

import clsx from "clsx";
import React from "react";


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
  pageSizeOptions,
  onChange,
  onPageSizeChange,
}: {
  pages: number;
  page: number;
  pageSize: number;
  pageSizeOptions?: number[];
  onChange: (page: number) => void;
  onPageSizeChange: (pageSize: number) => void;
}) {
  // React Compiler will automatically optimize these computations
  const baseOptions =
    Array.isArray(pageSizeOptions) && pageSizeOptions.length > 0
      ? pageSizeOptions
      : PAGINATION_PAGE_SIZE_OPTIONS;
  const options = baseOptions.filter((option) => option > 0).sort((a, b) => a - b);

  const paginationItemBase =
    "flex h-6 w-8 items-center justify-center rounded-full text-small font-medium transition-colors cursor-pointer";

  const selectedKeys = new Set([String(pageSize)]);

  // React Compiler will automatically optimize this callback
  const handlePageSizeChange = (key: Key) => {
    const selectedValue = Number(key);

    if (!Number.isNaN(selectedValue)) {
      onPageSizeChange(selectedValue);
    }
  };

  return (
    <div className="flex items-center gap-4">
      <IBasePagination
        disableAnimation
        disableCursorAnimation
        isCompact
        showControls
        classNames={{
          base: "items-center p-0 overflow-hidden",
          item: clsx(
            paginationItemBase,
            "bg-transparent text-primary data-[hover=true]:bg-primary-50 data-[hover=true]:text-primary"
          ),
          next: clsx(
            paginationItemBase,
            "border border-transparent text-default-500 data-[hover=true]:border-primary data-[hover=true]:text-primary"
          ),
          prev: clsx(
            paginationItemBase,
            "border border-transparent text-default-500 data-[hover=true]:border-primary data-[hover=true]:text-primary"
          ),
          cursor: clsx(paginationItemBase, "bg-primary-500 text-white"),
        }}
        page={page}
        size="sm"
        total={pages}
        onChange={onChange}
      />
      <IBaseDropdown
        placement="top"
        items={options.map((item) => ({
          key: String(item),
          textValue: String(item),
          children: String(item),
        }))}
        menu={{
          "aria-label": "Page size selection",
          className: "min-w-[60px]",
          selectedKeys,
          selectionMode: "single",
          onSelectionChange: (keys) => {
            const [selectedKey] = Array.from(keys);

            if (selectedKey != null) {
              handlePageSizeChange(selectedKey);
            }
          },
        }}
      >
        <IBaseButton
          className="text-small font-medium px-2 h-6"
          endContent={<ChevronIcon className="text-small rotate-90" />}
          size="sm"
          // variant=""
        >
          {pageSize}
        </IBaseButton>
      </IBaseDropdown>
    </div>
  );
}
