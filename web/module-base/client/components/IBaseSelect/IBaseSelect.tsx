import { Select as SelectPrimitive, SelectProps } from "@heroui/select";
import clsx from "clsx";
import React from "react";

export type IBaseSelectProps = SelectProps & {};
export const IBaseSelect = React.forwardRef<
  HTMLSelectElement,
  IBaseSelectProps
>((props, ref) => {
  const { isDisabled, classNames, ...rest } = props;

  return (
    <SelectPrimitive
      {...rest}
      ref={ref}
      fullWidth
      classNames={{
        base: clsx("max-w opacity-100", classNames?.base),
        label: clsx("text-small text-default-600", classNames?.label),
        mainWrapper: clsx(
          "cursor-not-allowed",
          isDisabled && "bg-default-200",
          classNames?.mainWrapper
        ),
        trigger: clsx(
          "placeholder:text-default-400 italic text-sm",
          classNames?.trigger
        ),
        popoverContent: clsx("p-0", classNames?.popoverContent),
        listbox: clsx("p-0", classNames?.listbox),
        helperWrapper: classNames?.helperWrapper,
        description: classNames?.description,
        errorMessage: classNames?.errorMessage,
        value: classNames?.value,
        selectorIcon: classNames?.selectorIcon,
        listboxWrapper: classNames?.listboxWrapper,
        innerWrapper: classNames?.innerWrapper,
      }}
      labelPlacement="outside"
      placeholder="Please select..."
      popoverProps={{
        classNames: {
          base: "p-0",
          content: "p-1",
        },
        ...rest.popoverProps,
      }}
      scrollShadowProps={{ size: 0 }}
      size="sm"
      variant="bordered"
    />
  );
});

IBaseSelect.displayName = "IBaseSelect";

export default IBaseSelect;
