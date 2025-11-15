export type LocalizeText = {
  vi?: string;
  en?: string;
} & {
  [key in string]: string | undefined;
};
