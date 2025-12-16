import type {
  CourseDto,
  CreateCoursePayload,
  UpdateCoursePayload,
} from "../interface/Course";

import JsonRpcClientService from "@base/client/services/JsonRpcClientService";

export default class CourseService extends JsonRpcClientService {
  list() {
    return this.call<{
      data: CourseDto[];
      total: number;
      message?: string;
    }>("hrm.course.list.getData", {});
  }

  getById(id: string) {
    return this.call<{
      data: CourseDto;
      message?: string;
    }>("hrm.course.curd.getDataById", { id });
  }

  create(payload: CreateCoursePayload) {
    return this.call<{
      data: CourseDto;
      message?: string;
    }>("hrm.course.curd.createCourse", payload);
  }

  update(payload: UpdateCoursePayload) {
    return this.call<{
      data: CourseDto;
      message?: string;
    }>("hrm.course.curd.updateData", payload);
  }
}

export const courseService = new CourseService();
