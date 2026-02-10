import { SelectItem, type SelectItemProps } from "@heroui/select";

export type IBaseSelectItemProps = SelectItemProps & {};

// Wrapper component that preserves HeroUI's static getCollectionNode
function IBaseSelectItemComponent({
  children,
  ...props
}: IBaseSelectItemProps) {
  return <SelectItem {...props}>{children}</SelectItem>;
}

// Forward static collection metadata required by React Aria / HeroUI
// to avoid `type.getCollectionNode is not a function` errors.
(IBaseSelectItemComponent as any).getCollectionNode = (SelectItem as any)
  .getCollectionNode;

export default IBaseSelectItemComponent;
