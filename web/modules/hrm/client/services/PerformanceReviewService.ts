import JsonRpcClientService from "@base/client/services/JsonRpcClientService";
import type {
  PerformanceReviewDto,
  CreatePerformanceReviewPayload,
  UpdatePerformanceReviewPayload,
} from "../interface/PerformanceReview";

export default class PerformanceReviewService extends JsonRpcClientService {
  list() {
    return this.call<{
      data: PerformanceReviewDto[];
      total: number;
      message?: string;
    }>("hrm.performance-review.list.getData", {});
  }

  getById(id: string) {
    return this.call<{
      data: PerformanceReviewDto;
      message?: string;
    }>("hrm.performance-review.curd.getDataById", { id });
  }

  create(payload: CreatePerformanceReviewPayload) {
    return this.call<{
      data: PerformanceReviewDto;
      message?: string;
    }>("hrm.performance-review.curd.createPerformanceReview", payload);
  }

  update(payload: UpdatePerformanceReviewPayload) {
    return this.call<{
      data: PerformanceReviewDto;
      message?: string;
    }>("hrm.performance-review.curd.updateData", payload);
  }
}

export const performanceReviewService = new PerformanceReviewService();

