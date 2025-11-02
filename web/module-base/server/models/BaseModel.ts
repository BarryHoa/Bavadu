import { ListParamsRequest } from "./interfaces/ListInterface";

export class BaseModel {
  getDefaultParamsForList = (params?: ListParamsRequest) => {
    const { offset, limit, search, filters, sorts } = params || {}  ;
    return {
      offset: offset || 0,
      limit: limit || 10,
      search: search || undefined,
      filters: filters || undefined,
      sorts: sorts || undefined,
    };
  }
  getPagination(options: { data?: any; total?: number }) {
    const { data, total = 0 } = options;

    return {
      data,
      total,
    };
  }
}

