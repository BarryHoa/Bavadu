import {
  SelectItem,
  Select as SelectPrimitive,
  SelectProps,
} from "@heroui/select";
import clsx from "clsx";

type SelectBaseProps = SelectProps & {};
const SelectBase = (props: SelectBaseProps) => {
  const { isDisabled } = props;
  return (
    <SelectPrimitive
      classNames={{
        base: "max-w opacity-100",
        label: "text-small text-default-600",
        mainWrapper: clsx(
          "cursor-not-allowed",
          isDisabled && "opacity-50 bg-content2  "
        ),
      }}
      labelPlacement="outside"
      variant="bordered"
      size="sm"
      placeholder="Select an animal"
      {...props}
      isDisabled={isDisabled}
    />
  );
};

export default SelectBase;
export { SelectItem };
