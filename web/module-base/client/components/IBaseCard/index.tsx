"use client";

import {
  CardProps,
  Card as HeroUICard,
  CardBody as HeroUICardBody,
  CardFooter as HeroUICardFooter,
  CardHeader as HeroUICardHeader,
} from "@heroui/card";
import React from "react";

export type IBaseCardProps = CardProps & {};

export const IBaseCard = React.forwardRef<HTMLDivElement, IBaseCardProps>(
  (props, ref) => {
    return <HeroUICard ref={ref} {...props} />;
  }
);

IBaseCard.displayName = "IBaseCard";

export const IBaseCardHeader: React.FC<any> = (props) => (
  <HeroUICardHeader {...props} />
);
export const IBaseCardBody: React.FC<any> = (props) => (
  <HeroUICardBody {...props} />
);
export const IBaseCardFooter: React.FC<any> = (props) => (
  <HeroUICardFooter {...props} />
);

export default IBaseCard;
