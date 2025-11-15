import {
  SelectItem,
  Select as SelectPrimitive,
  SelectProps,
} from "@heroui/select";
import clsx from "clsx";

export type IBaseSelectProps = SelectProps & {};
const IBaseSelect = (props: IBaseSelectProps) => {
  const { isDisabled, classNames, ...rest } = props;
  return (
    <SelectPrimitive
      {...rest}
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
      popoverProps={{
        classNames: {
          base: "p-0",
          content: "p-1",
        },
        ...rest.popoverProps,
      }}
      labelPlacement="outside"
      variant="bordered"
      size="sm"
      placeholder="Please select..."
      fullWidth
      scrollShadowProps={{ size: 0 }}
    />
  );
};

export default IBaseSelect;
export { SelectItem };
