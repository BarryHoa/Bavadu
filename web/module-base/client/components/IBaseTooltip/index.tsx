import { Tooltip, TooltipProps } from "@heroui/tooltip";
import clsx from "clsx";
import React from "react";

export type IBaseTooltipProps = TooltipProps & {};

export const IBaseTooltip = React.forwardRef<HTMLDivElement, IBaseTooltipProps>(
  (props, ref) => {
    const { placement = "top", showArrow = true, classNames, ...rest } = props;

    return (
      <Tooltip
        ref={ref}
        classNames={{
          base: clsx("bg-primary-400/80 backdrop-blur-sm", classNames?.base),
          content: clsx("text-white/90", classNames?.content),
          ...classNames,
        }}
        color="primary"
        placement={placement}
        showArrow={showArrow}
        {...rest}
      />
    );
  }
);

IBaseTooltip.displayName = "IBaseTooltip";

export default IBaseTooltip;
