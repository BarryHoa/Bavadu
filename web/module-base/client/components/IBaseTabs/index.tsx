import { Tab, Tabs as TabsPrimitive, TabsProps } from "@heroui/tabs";
import clsx from "clsx";
import React from "react";

export type { TabsProps as IBaseTabsProps };

const IBaseTabs = React.forwardRef<HTMLDivElement, TabsProps>((props, ref) => {
  const { classNames, size = "sm", variant = "bordered", ...rest } = props;

  return (
    <TabsPrimitive
      {...rest}
      ref={ref}
      classNames={{
        base: clsx("w-full mb-0", classNames?.base),
        tabList: clsx("gap-0 overflow-x-auto mb-0", classNames?.tabList),
        tab: clsx("max-w-[80px]", classNames?.tab),
        tabContent: clsx("max-w-[120px]", classNames?.tabContent),
        panel: clsx("p-1", classNames?.panel),
        cursor: classNames?.cursor,
      }}
      size={size}
      variant={variant}
    />
  );
});

IBaseTabs.displayName = "IBaseTabs";

export default IBaseTabs;
export { Tab };
