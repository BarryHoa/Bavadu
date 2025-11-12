import { Input as HeroUIInput, InputProps } from "@heroui/input";
import clsx from "clsx";

type InputBaseType = InputProps & {};
const InputBase = (props: InputBaseType) => {
  const { isDisabled } = props;
  return (
    <HeroUIInput
      classNames={{
        base: "max-w opacity-100",
        label: "text-small text-default-600",
        mainWrapper: clsx(
          "cursor-not-allowed",
          isDisabled && "opacity-50 bg-content2  "
        ),
      }}
      variant="bordered"
      labelPlacement="outside-top"
      size="sm"
      {...props}
      isDisabled={isDisabled}
    />
  );
};

export default InputBase;
