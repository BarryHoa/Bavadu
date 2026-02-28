export type MenuWorkspaceKey = string;

export interface MenuWorkspaceElement<
  K extends MenuWorkspaceKey = MenuWorkspaceKey,
> {
  key: K;
  name: string;
  path?: string;
  as?: string;
  icon: string;
  order?: number;
  badge?: string;
  /** If set, item is shown only when user has this permission (filtered server-side) */
  permission?: string;
  type: "main" | "mdl";
  children?: MenuWorkspaceElement<K>[];
  parentKey?: K;
  module: string;
}
