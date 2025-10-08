import { Select as SelectPrimitive, SelectProps } from "@heroui/select";

type SelectBaseProps = SelectProps & {};
const SelectBase = (props: SelectBaseProps) => (
  <SelectPrimitive labelPlacement="outside" size="sm" {...props} />
);
export default SelectBase;
