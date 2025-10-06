import { forwardRef } from "react";
import {
  Card as HeroCard,
  CardHeader as HeroCardHeader,
  CardBody as HeroCardBody,
  CardFooter as HeroCardFooter,
} from "@heroui/react";
import { cn } from "@/lib/utils";

export type CardProps = React.ComponentProps<typeof HeroCard>;
export type CardHeaderProps = React.ComponentProps<typeof HeroCardHeader>;
export type CardContentProps = React.ComponentProps<typeof HeroCardBody>;
export type CardFooterProps = React.ComponentProps<typeof HeroCardFooter>;
export interface CardTitleProps
  extends React.HTMLAttributes<HTMLHeadingElement> {}
export interface CardDescriptionProps
  extends React.HTMLAttributes<HTMLParagraphElement> {}

export const Card = forwardRef<HTMLDivElement, CardProps>(
  ({ className, ...props }, ref) => {
    return <HeroCard ref={ref} className={cn("", className)} {...props} />;
  }
);

export const CardHeader = forwardRef<HTMLDivElement, CardHeaderProps>(
  ({ className, ...props }, ref) => {
    return (
      <HeroCardHeader ref={ref} className={cn("", className)} {...props} />
    );
  }
);

export const CardContent = forwardRef<HTMLDivElement, CardContentProps>(
  ({ className, ...props }, ref) => {
    return <HeroCardBody ref={ref} className={cn("", className)} {...props} />;
  }
);

export const CardFooter = forwardRef<HTMLDivElement, CardFooterProps>(
  ({ className, ...props }, ref) => {
    return (
      <HeroCardFooter ref={ref} className={cn("", className)} {...props} />
    );
  }
);

export const CardTitle = forwardRef<HTMLHeadingElement, CardTitleProps>(
  ({ className, ...props }, ref) => {
    return (
      <h3
        ref={ref}
        className={cn("text-lg font-semibold", className)}
        {...props}
      />
    );
  }
);

export const CardDescription = forwardRef<
  HTMLParagraphElement,
  CardDescriptionProps
>(({ className, ...props }, ref) => {
  return (
    <p
      ref={ref}
      className={cn("text-sm text-foreground/70", className)}
      {...props}
    />
  );
});

Card.displayName = "Card";
CardHeader.displayName = "CardHeader";
CardTitle.displayName = "CardTitle";
CardDescription.displayName = "CardDescription";
CardContent.displayName = "CardContent";
CardFooter.displayName = "CardFooter";
