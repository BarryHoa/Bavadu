declare module "minisearch" {
  export interface MiniSearchOptions<T> {
    fields: Array<keyof T | string>;
    storeFields?: Array<keyof T | string>;
    idField?: keyof T | string;
  }

  export default class MiniSearch<T = any> {
    constructor(options: MiniSearchOptions<T>);
    add(document: T): void;
    addAll(documents: T[]): void;
    search(
      query: string,
      options?: Record<string, unknown>,
    ): Array<T & { id: string }>;
  }
}
