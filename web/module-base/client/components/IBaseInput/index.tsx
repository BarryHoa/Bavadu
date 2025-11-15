import { Input as HeroUIInput, InputProps } from "@heroui/input";
import clsx from "clsx";

type IBaseInputProps = InputProps & {};
const IBaseInput = (props: IBaseInputProps) => {
  const { isDisabled } = props;
  return (
    <HeroUIInput
      classNames={{
        base: "max-w opacity-100",
        label: "text-small text-default-600",
        mainWrapper: clsx(
          "cursor-not-allowed",
          isDisabled ? "bg-default-200" : ""
        ),
        input: "placeholder:text-default-400 italic text-sm",
      }}
      variant="bordered"
      labelPlacement="outside-top"
      size="sm"
      {...props}
      isDisabled={isDisabled}
    />
  );
};

export default IBaseInput;

