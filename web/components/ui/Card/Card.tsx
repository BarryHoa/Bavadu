import { forwardRef } from "react";
import { x } from "@xstyled/emotion";
import { cn } from "@/lib/utils";

// Card variants using XStyled
const getCardVariantStyles = (variant: string) => {
  switch (variant) {
    case "default":
      return {
        bg: "background",
        border: "1px solid",
        borderColor: "border",
      };
    case "outlined":
      return {
        bg: "background",
        border: "2px solid",
        borderColor: "border",
      };
    case "elevated":
      return {
        bg: "background",
        boxShadow: "lg",
      };
    default:
      return {};
  }
};

const getCardPaddingStyles = (padding: string) => {
  switch (padding) {
    case "none":
      return { p: 0 };
    case "sm":
      return { p: "sm" };
    case "md":
      return { p: "md" };
    case "lg":
      return { p: "lg" };
    default:
      return { p: "md" };
  }
};

// Card sub-components
const StyledCardHeader = (props: any) => (
  <x.div
    display="flex"
    flexDirection="column"
    gap="xs"
    p="md"
    borderBottom="1px solid"
    borderColor="border"
    {...props}
  />
);

const StyledCardTitle = (props: any) => (
  <x.h3
    fontSize="lg"
    fontWeight="semibold"
    color="foreground"
    margin="0"
    {...props}
  />
);

const StyledCardDescription = (props: any) => (
  <x.p fontSize="sm" color="mutedForeground" margin="0" {...props} />
);

const StyledCardContent = (props: any) => (
  <x.div p="md" color="foreground" {...props} />
);

const StyledCardFooter = (props: any) => (
  <x.div
    display="flex"
    alignItems="center"
    gap="sm"
    p="md"
    borderTop="1px solid"
    borderColor="border"
    {...props}
  />
);

// Card interfaces
export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "outlined" | "elevated";
  padding?: "none" | "sm" | "md" | "lg";
}

export interface CardHeaderProps extends React.HTMLAttributes<HTMLDivElement> {}
export interface CardTitleProps
  extends React.HTMLAttributes<HTMLHeadingElement> {}
export interface CardDescriptionProps
  extends React.HTMLAttributes<HTMLParagraphElement> {}
export interface CardContentProps
  extends React.HTMLAttributes<HTMLDivElement> {}
export interface CardFooterProps extends React.HTMLAttributes<HTMLDivElement> {}

// Card components
export const Card = forwardRef<HTMLDivElement, CardProps>(
  ({ className, variant = "default", padding = "md", ...props }, ref) => {
    const variantStyles = getCardVariantStyles(variant);
    const paddingStyles = getCardPaddingStyles(padding);

    return (
      <x.div
        ref={ref}
        className={cn("", className)}
        borderRadius="lg"
        overflow="hidden"
        transition="all 0.2s ease"
        {...variantStyles}
        {...paddingStyles}
        {...props}
      />
    );
  }
);

export const CardHeader = forwardRef<HTMLDivElement, CardHeaderProps>(
  ({ className, ...props }, ref) => {
    return (
      <StyledCardHeader ref={ref} className={cn("", className)} {...props} />
    );
  }
);

export const CardTitle = forwardRef<HTMLHeadingElement, CardTitleProps>(
  ({ className, ...props }, ref) => {
    return (
      <StyledCardTitle ref={ref} className={cn("", className)} {...props} />
    );
  }
);

export const CardDescription = forwardRef<
  HTMLParagraphElement,
  CardDescriptionProps
>(({ className, ...props }, ref) => {
  return (
    <StyledCardDescription ref={ref} className={cn("", className)} {...props} />
  );
});

export const CardContent = forwardRef<HTMLDivElement, CardContentProps>(
  ({ className, ...props }, ref) => {
    return (
      <StyledCardContent ref={ref} className={cn("", className)} {...props} />
    );
  }
);

export const CardFooter = forwardRef<HTMLDivElement, CardFooterProps>(
  ({ className, ...props }, ref) => {
    return (
      <StyledCardFooter ref={ref} className={cn("", className)} {...props} />
    );
  }
);

// Set display names
Card.displayName = "Card";
CardHeader.displayName = "CardHeader";
CardTitle.displayName = "CardTitle";
CardDescription.displayName = "CardDescription";
CardContent.displayName = "CardContent";
CardFooter.displayName = "CardFooter";
