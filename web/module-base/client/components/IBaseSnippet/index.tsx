"use client";

import { Snippet as HeroUISnippet, SnippetProps } from "@heroui/snippet";
import React from "react";

export type IBaseSnippetProps = SnippetProps & {};

export const IBaseSnippet: React.FC<IBaseSnippetProps> = (props) => {
  const { size = "sm", ...rest } = props;

  return <HeroUISnippet size={size} {...rest} />;
};

export default IBaseSnippet;
