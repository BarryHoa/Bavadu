"use client";

import { AvatarGroupProps, AvatarProps, Avatar as HeroUIAvatar, AvatarGroup as HeroUIAvatarGroup } from "@heroui/avatar";
import React from "react";

export type IBaseAvatarProps = AvatarProps & {};

export const IBaseAvatar = React.forwardRef<HTMLSpanElement, IBaseAvatarProps>(
  (props, ref) => {
    const { size = "sm", ...rest } = props;

    return <HeroUIAvatar ref={ref} size={size} {...rest} />;
  }
);

IBaseAvatar.displayName = "IBaseAvatar";

export const IBaseAvatarGroup = React.forwardRef<HTMLDivElement, AvatarGroupProps>(
  (props, ref) => {
    const { size = "sm", ...rest } = props;

    return <HeroUIAvatarGroup ref={ref} size={size} {...rest} />;
  }
);

IBaseAvatarGroup.displayName = "IBaseAvatarGroup";

export default IBaseAvatar;
