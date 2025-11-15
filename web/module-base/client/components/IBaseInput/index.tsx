import { Input as HeroUIInput, InputProps } from "@heroui/input";
import clsx from "clsx";
import React from "react";

type IBaseInputProps = InputProps & {};
const IBaseInput = React.forwardRef<HTMLInputElement, IBaseInputProps>(
  (props, ref) => {
    const { isDisabled } = props;
    return (
      <HeroUIInput
        ref={ref}
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
        labelPlacement="outside"
        size="sm"
        {...props}
        isDisabled={isDisabled}
      />
    );
  }
);

IBaseInput.displayName = "IBaseInput";

export default IBaseInput;
