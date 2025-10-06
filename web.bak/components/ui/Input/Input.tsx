import { forwardRef } from "react";
import {
  Input as HeroInput,
  type InputProps as HeroInputProps,
} from "@heroui/react";
import { cn } from "@/lib/utils";

export interface InputProps extends Omit<HeroInputProps, "size"> {
  size?: "sm" | "md" | "lg";
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, size = "md", isDisabled, ...props }, ref) => {
    const sizeMap = { sm: "sm", md: "md", lg: "lg" } as const;

    return (
      <HeroInput
        ref={ref}
        className={cn("", className)}
        size={sizeMap[size]}
        isDisabled={isDisabled}
        {...props}
      />
    );
  }
);

Input.displayName = "Input";
