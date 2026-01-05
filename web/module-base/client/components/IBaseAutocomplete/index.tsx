"use client";

import {
  AutocompleteProps,
  Autocomplete as HeroUIAutocomplete,
  AutocompleteItem as HeroUIAutocompleteItem,
  AutocompleteSection as HeroUIAutocompleteSection,
} from "@heroui/autocomplete";
import React from "react";

export type IBaseAutocompleteProps = AutocompleteProps & {};

export const IBaseAutocomplete = React.forwardRef<
  HTMLInputElement,
  IBaseAutocompleteProps
>((props, ref) => {
  const { size = "sm", variant = "bordered", ...rest } = props;

  return (
    <HeroUIAutocomplete ref={ref} size={size} variant={variant} {...rest} />
  );
});

IBaseAutocomplete.displayName = "IBaseAutocomplete";

export const IBaseAutocompleteItem = HeroUIAutocompleteItem;
export const IBaseAutocompleteSection = HeroUIAutocompleteSection;

export default IBaseAutocomplete;
