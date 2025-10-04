import { forwardRef, useId } from "react";
import { x } from "@xstyled/emotion";
import { cn } from "@/lib/utils";

// Input size styles using XStyled
const getInputSizeStyles = (size: string) => {
  const h = {
    sm: "2rem",
    md: "2.5rem",
    lg: "3rem",
  }
  const px = {
    sm: "sm",
    md: "md",
    lg: "lg",
  }
  const fontSize = {
    sm: "xs",
    md: "sm",
    lg: "base",
  }
  return  {
    h: h[size as keyof typeof h],
    px: px[size as keyof typeof px],
    fontSize: fontSize[size as keyof typeof fontSize] ?? "sm",
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
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "size"> {
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
          // fontSize="sm"
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
