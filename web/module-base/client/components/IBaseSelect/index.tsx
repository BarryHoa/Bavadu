import {
  SelectItem,
  Select as SelectPrimitive,
  SelectProps,
} from "@heroui/select";
import clsx from "clsx";

type IBaseSelectProps = SelectProps & {};
const IBaseSelect = (props: IBaseSelectProps) => {
  const { isDisabled } = props;
  return (
    <SelectPrimitive
      classNames={{
        base: "max-w opacity-100",
        label: "text-small text-default-600",
        mainWrapper: clsx("cursor-not-allowed", isDisabled && "bg-default-200"),
        trigger: "placeholder:text-default-400 italic text-sm",
      }}
      labelPlacement="outside"
      variant="bordered"
      size="sm"
      placeholder="Please select..."
      {...props}
    />
  );
};

export default IBaseSelect;
export { SelectItem };
