"use client";

import type { ButtonProps } from "@heroui/button";
import { Button } from "@heroui/button";
import clsx from "clsx";
import React from "react";

export type ButtonFastChooseProps = {
  label: React.ReactNode;
  onPress: () => void;
  align?: "start" | "center" | "end";
  wrapperClassName?: string;
  buttonProps?: Omit<ButtonProps, "children" | "onPress">;
};

const alignClass = (align: ButtonFastChooseProps["align"]) => {
  switch (align) {
    case "start":
      return "justify-start";
    case "end":
      return "justify-end";
    case "center":
    default:
      return "justify-center";
  }
};

export default function ButtonFastChoose({
  label,
  onPress,
  align = "center",
  wrapperClassName,
  buttonProps,
}: ButtonFastChooseProps) {
  return (
    <div className={clsx("flex py-1", alignClass(align), wrapperClassName)}>
      <Button
        size="sm"
        color="primary"
        variant="flat"
        {...buttonProps}
        onPress={onPress}
      >
        {label}
      </Button>
    </div>
  );
}
