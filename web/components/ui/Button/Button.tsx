import { forwardRef } from "react";
import { x } from "@xstyled/emotion";
import styled from "@emotion/styled";
import { cn } from "@/lib/utils";

// Button variants using XStyled
const getButtonVariantStyles = (variant: string) => {
  switch (variant) {
    case "primary":
      return {
        bg: "primary.500",
        color: "white",
        _hover: { bg: "primary.600" },
        _active: { bg: "primary.700" },
      };
    case "secondary":
      return {
        bg: "secondary.100",
        color: "secondary.900",
        _hover: { bg: "secondary.200" },
        _active: { bg: "secondary.300" },
      };
    case "outline":
      return {
        bg: "transparent",
        color: "primary.500",
        border: "1px solid",
        borderColor: "primary.500",
        _hover: { bg: "primary.50" },
        _active: { bg: "primary.100" },
      };
    case "ghost":
      return {
        bg: "transparent",
        color: "primary.500",
        _hover: { bg: "primary.50" },
        _active: { bg: "primary.100" },
      };
    case "destructive":
      return {
        bg: "error.500",
        color: "white",
        _hover: { bg: "error.600" },
        _active: { bg: "error.700" },
      };
    default:
      return {};
  }
};

const getButtonSizeStyles = (size: string) => {
  switch (size) {
    case "sm":
      return {
        px: "sm",
        py: "xs",
        fontSize: "sm",
        h: "2rem",
      };
    case "md":
      return {
        px: "md",
        py: "sm",
        fontSize: "base",
        h: "2.5rem",
      };
    case "lg":
      return {
        px: "lg",
        py: "md",
        fontSize: "lg",
        h: "3rem",
      };
    default:
      return {};
  }
};

// Loading spinner styled component
const StyledSpinner = styled.div<{ size: string }>`
  width: ${({ size }) => size};
  height: ${({ size }) => size};
  border: 2px solid transparent;
  border-top: 2px solid currentColor;
  border-radius: 50%;
  animation: spin 1s linear infinite;

  @keyframes spin {
    0% {
      transform: rotate(0deg);
    }
    100% {
      transform: rotate(360deg);
    }
  }
`;

// Loading spinner component
const LoadingSpinner = ({ size }: { size?: "sm" | "md" | "lg" }) => {
  const spinnerSize = size === "sm" ? "12px" : size === "lg" ? "20px" : "16px";

  return <StyledSpinner size={spinnerSize} />;
};

// Icon wrapper
const IconWrapper = ({
  size,
  children,
}: {
  size?: "sm" | "md" | "lg";
  children: React.ReactNode;
}) => {
  const iconSize = size === "sm" ? "16px" : size === "lg" ? "24px" : "20px";

  return (
    <x.div
      display="flex"
      alignItems="center"
      justifyContent="center"
      w={iconSize}
      h={iconSize}
    >
      {children}
    </x.div>
  );
};

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "outline" | "ghost" | "destructive";
  size?: "sm" | "md" | "lg";
  loading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  children?: React.ReactNode;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant = "primary",
      size = "md",
      loading = false,
      leftIcon,
      rightIcon,
      children,
      disabled,
      ...props
    },
    ref
  ) => {
    const variantStyles = getButtonVariantStyles(variant);
    const sizeStyles = getButtonSizeStyles(size);

    return (
      <x.button
        ref={ref}
        className={cn("", className)}
        disabled={disabled || loading}
        display="inline-flex"
        alignItems="center"
        justifyContent="center"
        gap="sm"
        borderRadius="md"
        fontWeight="medium"
        transition="all 0.2s ease"
        cursor="pointer"
        border="none"
        outline="none"
        _focus={{
          outline: "2px solid",
          outlineColor: "ring",
          outlineOffset: "2px",
        }}
        _disabled={{
          opacity: 0.5,
          cursor: "not-allowed",
        }}
        {...variantStyles}
        {...sizeStyles}
        {...props}
      >
        {loading ? (
          <LoadingSpinner size={size} />
        ) : leftIcon ? (
          <IconWrapper size={size}>{leftIcon}</IconWrapper>
        ) : null}
        {children}
        {!loading && rightIcon && (
          <IconWrapper size={size}>{rightIcon}</IconWrapper>
        )}
      </x.button>
    );
  }
);

Button.displayName = "Button";
