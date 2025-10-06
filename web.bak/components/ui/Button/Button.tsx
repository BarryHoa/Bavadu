import { forwardRef } from "react";
import {
  Button as HeroButton,
  type ButtonProps as HeroUIButtonProps,
} from "@heroui/react";
import { cn } from "@/lib/utils";

export interface ButtonProps
  extends Omit<HeroUIButtonProps, "variant" | "size" | "color" | "type"> {
  type?: "primary" | "secondary" | "outline" | "default" | "dashed";
  size?: "sm" | "md" | "lg";
  color?: HeroUIButtonProps["color"];
  loading?: boolean;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      type = "default",
      size = "md",
      loading = false,
      children,
      disabled,
      color,
      ...props
    },
    ref
  ) => {
    // Map our old prop `type` to HeroUI `variant`
    const variantMap: Record<
      NonNullable<ButtonProps["type"]>,
      NonNullable<HeroUIButtonProps["variant"]>
    > = {
      primary: "solid",
      secondary: "faded",
      outline: "bordered",
      default: "ghost",
      dashed: "bordered",
    } as const;

    // Map size
    const sizeMap: Record<
      NonNullable<ButtonProps["size"]>,
      NonNullable<HeroUIButtonProps["size"]>
    > = {
      sm: "sm",
      md: "md",
      lg: "lg",
    } as const;

    return (
      <HeroButton
        ref={ref}
        className={cn("", className)}
        variant={variantMap[type]}
        size={sizeMap[size]}
        isLoading={loading}
        isDisabled={disabled}
        color={color}
        {...props}
      >
        {children}
      </HeroButton>
    );
  }
);

Button.displayName = "Button";
