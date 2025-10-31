export type LocaleDataType<DataT extends string = string> = {
  vi?: DataT;
  en?: DataT;
} & {
  [key in string]: DataT | undefined;
}