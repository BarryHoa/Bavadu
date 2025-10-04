import { forwardRef, useId } from "react";
import styled, { x } from "@xstyled/emotion";
import { cn } from "@/lib/utils";
import FlexBox from "../FlexBox";
import getInputSizeStyles from "./utils/getInputSizeStyles";

// Input container

// Label

// Input interfaces
export interface InputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "size" | "type"> {
  size?: "sm" | "md" | "lg";
  type?: "text" | "password" | "email" | "tel" | "url";
  count?: number;
  status?: "default" | "success" | "error" | "warning";
}

export const InputStyled = styled(x.input)<InputProps>`
  display: flex;
  width: 100%;
  border-radius: 4px;
  font-weight: normal;
  transition: all 0.1s ease;
  outline: none;

  background-color: ${({ theme }) => theme.colors.background};
  border: 1px solid ${({ theme }) => theme.colors.border};
  color: ${({ theme }) => theme.colors.textPrimary};
  cursor: text;

  /* Hover */
  &:hover:not(:disabled) {
    border-color: ${({ theme }) => theme.colors.blue.blue5};
  }

  /* Focus */
  &:focus:not(:disabled) {
    border-color: ${({ theme }) => theme.colors.blue.blue6};
  }

  /* Focus-visible */
  &:focus-visible:not(:disabled) {
    border-color: ${({ theme }) => theme.colors.blue.blue6};
  }

  /* Disabled */
  &:disabled {
    background-color: ${({ theme }) => theme.colors.gray.gray5};
    color: ${({ theme }) => theme.colors.gray.gray7};
    cursor: not-allowed;
    border-color: ${({ theme }) => theme.colors.border};
  }
`;
// Input component
export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, disabled, size = "md", id, ...props }, ref) => {
    const generatedId = useId();
    const inputId = id || generatedId;
    const sizeStyles = getInputSizeStyles(size);

    console.log("Input props:", { sizeStyles });
    return (
      <FlexBox>
        <InputStyled
          ref={ref}
          id={inputId}
          className={cn("", className)}
          // aria-invalid={!!error}
          // aria-describedby={error ? `${inputId}-error` : undefined}
          disabled={disabled}
          {...sizeStyles}
          {...props}
        />
      </FlexBox>
    );
  }
);

Input.displayName = "Input";
