export const DEFAULT_LANG = "en";
export const DEFAULT_SUPPORTED_LANGS: LocalizeTextKey[] = ["en", "vi"];

// key is en or vi
export type LocalizeTextKey = "en" | "vi";

export type LocalizeText = Partial<
  Record<LocalizeTextKey, string | undefined>
> & {
  [key: string]: string | undefined;
};
