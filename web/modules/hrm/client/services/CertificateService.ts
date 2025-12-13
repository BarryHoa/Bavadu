import JsonRpcClientService from "@base/client/services/JsonRpcClientService";
import type {
  CertificateDto,
  CreateCertificatePayload,
  UpdateCertificatePayload,
} from "../interface/Certificate";

export default class CertificateService extends JsonRpcClientService {
  list() {
    return this.call<{
      data: CertificateDto[];
      total: number;
      message?: string;
    }>("hrm.certificate.list.getData", {});
  }

  getById(id: string) {
    return this.call<{
      data: CertificateDto;
      message?: string;
    }>("hrm.certificate.curd.getDataById", { id });
  }

  create(payload: CreateCertificatePayload) {
    return this.call<{
      data: CertificateDto;
      message?: string;
    }>("hrm.certificate.curd.createCertificate", payload);
  }

  update(payload: UpdateCertificatePayload) {
    return this.call<{
      data: CertificateDto;
      message?: string;
    }>("hrm.certificate.curd.updateData", payload);
  }
}

export const certificateService = new CertificateService();

