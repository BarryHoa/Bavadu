export type MenuFactoryElm = {
  key: string;
  name: string;
  path?: string;
  as?: string;
  icon?: string;
  order?: number;
  /** If set, menu item is shown only when user has this permission key */
  permission?: string;
  children?: MenuFactoryElm[];
  module: string;
  type: "main" | "mdl";
};
