"use client";

import { Spinner as HeroUISpinner, SpinnerProps } from "@heroui/spinner";
import React from "react";

export type IBaseSpinnerContentProps = SpinnerProps & {
  children?: React.ReactNode;
  spinning?: boolean;
};

export const IBaseSpinnerContent = React.forwardRef<
  HTMLDivElement,
  IBaseSpinnerContentProps
>((props, ref) => {
  const { size = "sm", spinning = false, children, ...rest } = props;

  return (
    <div ref={ref} className="relative flex flex-1 spinner-container">
      {children}
      {spinning && (
        <div className="spinner-content absolute inset-0 flex items-center justify-center w-full h-full pointer-events-none ">
          <HeroUISpinner size={size} {...rest} />
        </div>
      )}
    </div>
  );
});
IBaseSpinnerContent.displayName = "IBaseSpinnerContent";
export default IBaseSpinnerContent;
