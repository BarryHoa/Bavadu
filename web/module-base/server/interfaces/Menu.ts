export type MenuFactoryElm = {
  key: string;
  name: string;
  path?: string;
  as?: string;
  icon?: string;
  children?: MenuFactoryElm[];
};
