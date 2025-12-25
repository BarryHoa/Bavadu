import { tv as herouiTv, type VariantProps as HerouiVariantProps } from "@heroui/theme";

export const tv = herouiTv;
export type VariantProps<T extends (...args: any) => any> = HerouiVariantProps<T>;

