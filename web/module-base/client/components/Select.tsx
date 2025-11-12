import {
  SelectItem,
  Select as SelectPrimitive,
  SelectProps,
} from "@heroui/select";

type SelectBaseProps = SelectProps & {};
const SelectBase = (props: SelectBaseProps) => (
  <SelectPrimitive
    labelPlacement="outside"
    variant="bordered"
    size="sm"
    {...props}
    placeholder="Select an animal"
    disabled
  />
);

export default SelectBase;
export { SelectItem };
