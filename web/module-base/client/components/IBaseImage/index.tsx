"use client";

import { Image as HeroUIImage, ImageProps } from "@heroui/image";
import React from "react";

export type IBaseImageProps = ImageProps & {};

export const IBaseImage: React.FC<IBaseImageProps> = (props) => {
  return <HeroUIImage {...props} />;
};

export default IBaseImage;
