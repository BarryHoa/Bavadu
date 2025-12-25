"use client";

import { Skeleton as HeroUISkeleton, SkeletonProps } from "@heroui/skeleton";
import React from "react";

export type IBaseSkeletonProps = SkeletonProps & {};

export const IBaseSkeleton: React.FC<IBaseSkeletonProps> = (props) => {
  return <HeroUISkeleton {...props} />;
};

export default IBaseSkeleton;
