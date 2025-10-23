import {
  Select as SelectPrimitive,
  SelectProps,
  SelectItem,
} from "@heroui/select";

type SelectBaseProps = SelectProps & {};
const SelectBase = (props: SelectBaseProps) => (
  <SelectPrimitive labelPlacement="outside" size="sm" {...props} />
);

export default SelectBase;
export { SelectItem };
