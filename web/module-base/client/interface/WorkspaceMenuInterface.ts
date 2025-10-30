export type MenuWorkspaceKey = string;

export interface MenuWorkspaceElement<
  K extends MenuWorkspaceKey = MenuWorkspaceKey,
> {
  key: K;
  name: string;
  path?: string;
  as?: string;
  icon: string;
  badge?: string;
  children?: MenuWorkspaceElement<K>[];
}
