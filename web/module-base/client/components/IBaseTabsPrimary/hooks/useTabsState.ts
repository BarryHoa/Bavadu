import { useCallback, useState } from "react";

export interface UseTabsStateProps {
  selectedKey?: React.Key;
  defaultSelectedKey?: React.Key;
  onSelectionChange?: (key: React.Key) => void;
  firstKey: string | null;
}

export interface UseTabsStateReturn {
  effectiveKey: string | null;
  onSelect: (key: string) => void;
}

export function useTabsState({
  selectedKey: selectedKeyProp,
  defaultSelectedKey,
  onSelectionChange,
  firstKey,
}: UseTabsStateProps): UseTabsStateReturn {
  const [internalKey, setInternalKey] = useState<string | null>(() => {
    if (defaultSelectedKey != null) return String(defaultSelectedKey);

    return null;
  });

  const isControlled = selectedKeyProp !== undefined;
  const selectedKey = isControlled
    ? selectedKeyProp != null
      ? String(selectedKeyProp)
      : null
    : internalKey;

  const effectiveKey = selectedKey ?? firstKey;

  const onSelect = useCallback(
    (key: string) => {
      if (!isControlled) setInternalKey(key);
      onSelectionChange?.(key);
    },
    [isControlled, onSelectionChange],
  );

  return { effectiveKey, onSelect };
}
