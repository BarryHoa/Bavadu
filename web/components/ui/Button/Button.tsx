import { forwardRef } from "react";
import { x } from "@xstyled/emotion";
import styled from "@emotion/styled";
import { cn } from "@/lib/utils";
import getButtonSizeStyles from "./utils/getInputSizeStyles";

// Button variants using XStyled

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
  extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, "size" | "type"> {
  type?: "primary" | "secondary" | "outline" | "default" | "dashed";
  color?: string;
  size?: "sm" | "md" | "lg";
  loading?: boolean;
  children?: React.ReactNode;
}

const ButtonStyled = styled(x.button)<ButtonProps>`
  display: inline-flex;
  border-radius: 4px;
  font-weight: 500;
  transition: all 0.1s ease;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  text-align: center;
  text-decoration: none;
  user-select: none;
  vertical-align: middle;
  white-space: nowrap;
  outline: none;

  ${(props) => {
    const { type, theme, color } = props;
    console.log("Button type:", type);
    const colors = theme.colors;
    switch (type) {
      case "primary":
        return `
          background-color: ${colors.primary};
          color: ${colors.gray.gray1};
          border: 1px solid ${colors.primary};
          &:active {
             boxShadow: "0 0 0 6px ${colors.primary}",
          }
        `;
      case "secondary":
        return `
            background: ${colors.secondary};
            color: ${colors.gray.gray1};
            border: 1px solid ${colors.secondary};
            &:active {
              boxShadow: "0 0 0 6px ${colors.secondary}",
            }
          `;
      case "outline":
        return `
            background: transparent;
            color: ${color ?? colors.primary};
            border: 1px solid ${color ?? colors.primary};
            &:hover:not(:disabled) {
              background: ${color ?? colors.primary};
              color: ${colors.gray.gray1};
            }
            &:active {
              boxShadow: "0 0 0 6px ${colors.primary}",
            }
          `;
      default: {
        return `
            background: ${colors.background};
            color: ${colors.textPrimary};
            border: 1px solid ${colors.border};
            &:hover {
              background: ${colors.gray.gray3};
          }
        `;
      }
    }
  }}
  &:hover:not(:disabled) {
    opacity: 0.9;
  }
  &:active:not(:disabled) {
    transform: scale(0.98);
  }
  &:focus,
  &:focus-visible,
  &:focus-within {
    outline: none;
  }
`;

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
    const sizeStyles = getButtonSizeStyles(size);

    return (
      <ButtonStyled
        ref={ref}
        className={cn("", className)}
        type={type}
        color={color}
        {...sizeStyles}
        {...props}
      >
        {children}
      </ButtonStyled>
    );
  }
);

Button.displayName = "Button";
