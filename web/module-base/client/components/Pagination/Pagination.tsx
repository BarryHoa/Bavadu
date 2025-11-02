import { Pagination } from "@heroui/pagination";
import {
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
} from "@heroui/dropdown";
import { Button } from "@heroui/button";

import { PAGINATION_PAGE_SIZE_OPTIONS } from "./pagginationConts";

export const ChevronIcon = (props: React.SVGProps<SVGSVGElement>) => {
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
  total,
  page,
  pageSize,
  onChange,
  onPageSizeChange,
}: {
  total: number;
  page: number;
  pageSize: number;
  onChange: (page: number) => void;
  onPageSizeChange: (pageSize: number) => void;
}) {
  const handlePageSizeChange = (key: any) => {
    const selectedValue = Number(key);

    onPageSizeChange(selectedValue);
  };

  return (
    <div className="flex items-center gap-2">
      <Pagination
        disableCursorAnimation
        isCompact
        showControls
        className="gap-2"
        classNames={{
          base: "overflow-hidden",
          wrapper: "gap-0 h-8 rounded-sm border border-divider",
          item: "w-8 h-8 text-small rounded-none bg-transparent",
          next: "w-8 h-8 text-small rounded-none bg-transparent",
          prev: "w-8 h-8 text-small rounded-none bg-transparent",
          cursor: "w-8 h-8 text-small rounded-none bg-transparent",
        }}
        page={page}
        total={total}
        onChange={onChange}
      />
      <Dropdown placement="top">
        <DropdownTrigger>
          <Button
            className="min-w-[80px] h-8"
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
          selectedKeys={[String(pageSize)]}
          selectionMode="single"
          onSelectionChange={(keys) => {
            const selectedKey = Array.from(keys)[0];

            if (selectedKey) {
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
