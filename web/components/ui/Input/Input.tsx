import { forwardRef, useId } from "react";
import { x } from "@xstyled/emotion";
import { cn } from "@/lib/utils";

// Input size styles using XStyled
const getInputSizeStyles = (size: string) => {
  switch (size) {
    case "sm":
      return {
        h: "2rem",
        px: "sm",
        fontSize: "xs",
      };
    case "md":
      return {
        h: "2.5rem",
        px: "md",
        fontSize: "sm",
      };
    case "lg":
      return {
        h: "3rem",
        px: "lg",
        fontSize: "base",
      };
    default:
      return {};
  }
};

// Input container
const InputContainer = (props: any) => (
  <x.div
    display="flex"
    flexDirection="column"
    gap="xs"
    width="100%"
    {...props}
  />
);

// Label
const Label = (props: any) => (
  <x.label fontSize="sm" fontWeight="medium" color="foreground" {...props} />
);

// Error message
const ErrorMessage = (props: any) => (
  <x.p fontSize="xs" color="error.500" margin="0" {...props} />
);

// Input interfaces
export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  size?: "sm" | "md" | "lg";
  label?: string;
  error?: string;
  helperText?: string;
}

// Input component
export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, size = "md", label, error, helperText, id, ...props }, ref) => {
    const generatedId = useId();
    const inputId = id || generatedId;
    const sizeStyles = getInputSizeStyles(size);

    return (
      <InputContainer>
        {label && <Label htmlFor={inputId}>{label}</Label>}
        <x.input
          ref={ref}
          id={inputId}
          className={cn("", className)}
          aria-invalid={!!error}
          aria-describedby={error ? `${inputId}-error` : undefined}
          display="flex"
          width="100%"
          borderRadius="md"
          fontSize="sm"
          fontWeight="normal"
          transition="all 0.2s ease"
          outline="none"
          bg="background"
          border="1px solid"
          borderColor="border"
          color="foreground"
          _focus={{
            borderColor: "ring",
            boxShadow: "0 0 0 2px",
            boxShadowColor: "ring",
            boxShadowOpacity: 0.2,
          }}
          _placeholder={{
            color: "mutedForeground",
          }}
          _disabled={{
            opacity: 0.5,
            cursor: "not-allowed",
          }}
          {...sizeStyles}
          {...props}
        />
        {error && <ErrorMessage id={`${inputId}-error`}>{error}</ErrorMessage>}
        {helperText && !error && (
          <ErrorMessage style={{ color: "inherit", opacity: 0.7 }}>
            {helperText}
          </ErrorMessage>
        )}
      </InputContainer>
    );
  }
);

Input.displayName = "Input";
