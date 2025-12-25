"use client";

import { ButtonProps, Button as HeroUIButton } from "@heroui/button";
import React from "react";

export type IBaseButtonProps = ButtonProps & {};

export const IBaseButton = React.forwardRef<
  HTMLButtonElement,
  IBaseButtonProps
>((props, ref) => {
  const { size = "sm", variant = "solid", ...rest } = props;

  return <HeroUIButton ref={ref} size={size} variant={variant} {...rest} />;
});

IBaseButton.displayName = "IBaseButton";

export const Button = IBaseButton;

export default IBaseButton;
