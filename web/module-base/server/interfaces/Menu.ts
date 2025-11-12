export type MenuFactoryElm = {
  key: string;
  name: string;
  path?: string;
  as?: string;
  icon?: string;
  order?: number;
  children?: MenuFactoryElm[];
};
