import { SelectItem, type SelectItemProps } from "@heroui/select";

export type IBaseSelectItem = SelectItemProps & {};

export default function IBaseSelectItem({
  children,
  ...props
}: IBaseSelectItem) {
  return <SelectItem {...props}>{children}</SelectItem>;
}
