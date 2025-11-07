import { useCallback, useEffect, useState } from "react";

import type { Selection, TableProps } from "@heroui/table";

export type RowSelectionMode = "single" | "multiple";

export interface DataTableRowSelection<T = any> {
  type?: RowSelectionMode;
  selectedRowKeys?: Array<string | number>;
  defaultSelectedRowKeys?: Array<string | number>;
  onChange?: (
    selectedRowKeys: Array<string | number>,
    selectedRows: T[]
  ) => void;
}

const areSetsEqual = <T,>(a: Set<T>, b: Set<T>) => {
  if (a.size !== b.size) return false;

  for (const value of Array.from(a)) {
    if (!b.has(value)) return false;
  }

  return true;
};

const useDataTableSelection = <T,>(
  rowSelection: false | DataTableRowSelection<T>,
  dataSource: T[],
  getRowKey: (record: T, index: number) => string | number
):
  | Pick<
      TableProps,
      "selectionMode" | "selectedKeys" | "onSelectionChange"
    >
  | undefined => {
  const selectionConfig = rowSelection === false ? undefined : rowSelection;
  const isControlled =
    selectionConfig?.selectedRowKeys !== undefined &&
    selectionConfig.selectedRowKeys !== null;

  const selectionMode: TableProps["selectionMode"] | undefined =
    selectionConfig?.type || (selectionConfig ? "multiple" : undefined);

  const [internalSelectedKeys, setInternalSelectedKeys] = useState<
    Set<string | number>
  >(() => {
    if (!selectionConfig) return new Set();

    const keys =
      selectionConfig.selectedRowKeys ||
      selectionConfig.defaultSelectedRowKeys ||
      [];

    return new Set(keys);
  });

  const selectedRowKeys = selectionConfig?.selectedRowKeys;
  const defaultSelectedRowKeys = selectionConfig?.defaultSelectedRowKeys;

  useEffect(() => {
    if (!selectionConfig) {
      setInternalSelectedKeys((prev) => {
        if (prev.size === 0) return prev;
        return new Set();
      });
      return;
    }

    if (selectedRowKeys) {
      const nextKeys = new Set(selectedRowKeys);

      setInternalSelectedKeys((prev) =>
        areSetsEqual(prev, nextKeys) ? prev : nextKeys
      );
      return;
    }

    if (defaultSelectedRowKeys && defaultSelectedRowKeys.length > 0) {
      setInternalSelectedKeys((prev) => {
        if (prev.size > 0) return prev;
        return new Set(defaultSelectedRowKeys);
      });
    }
  }, [selectionConfig, selectedRowKeys, defaultSelectedRowKeys]);

  useEffect(() => {
    if (!selectionConfig) return;

    setInternalSelectedKeys((prev) => {
      const availableKeys = new Set(
        dataSource.map((item, index) => getRowKey(item, index))
      );
      const filteredKeys = new Set<string | number>();

      prev.forEach((key) => {
        if (availableKeys.has(key)) {
          filteredKeys.add(key);
        }
      });

      if (areSetsEqual(prev, filteredKeys)) {
        return prev;
      }

      if (isControlled) {
        return prev;
      }

      return filteredKeys;
    });
  }, [selectionConfig, dataSource, getRowKey, isControlled]);

  const handleSelectionChange = useCallback(
    (keys: Selection) => {
      if (!selectionConfig) return;

      const nextSelected = new Set<string | number>();

      if (keys === "all") {
        dataSource.forEach((item, index) => {
          nextSelected.add(getRowKey(item, index));
        });
      } else {
        keys.forEach((key) => {
          nextSelected.add(key as string | number);
        });
      }

      if (!isControlled) {
        setInternalSelectedKeys((prev) => {
          if (areSetsEqual(prev, nextSelected)) {
            return prev;
          }

          return nextSelected;
        });
      }

      if (selectionConfig.onChange) {
        const selectedRows = dataSource.filter((item, index) =>
          nextSelected.has(getRowKey(item, index))
        );

        selectionConfig.onChange(Array.from(nextSelected), selectedRows);
      }
    },
    [selectionConfig, dataSource, getRowKey, isControlled]
  );

  if (!selectionConfig) {
    return undefined;
  }

  return {
    selectionMode,
    selectedKeys: internalSelectedKeys,
    onSelectionChange: handleSelectionChange,
  };
};

export default useDataTableSelection;

