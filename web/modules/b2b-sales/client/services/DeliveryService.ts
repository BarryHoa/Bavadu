import JsonRpcClientService from "@base/client/services/JsonRpcClientService";

export interface DeliveryDto {
  id: string;
  orderType: string;
  orderId: string;
  warehouseId: string;
  deliveryDate: string;
  reference?: string | null;
  note?: string | null;
  status: string;
  createdAt?: string;
  updatedAt?: string;
  createdBy?: string | null;
}

export default class DeliveryService extends JsonRpcClientService {
  createFromOrder(payload: {
    orderType: "B2B" | "B2C";
    orderId: string;
    warehouseId: string;
    deliveryDate: string;
    reference?: string;
    note?: string;
    userId?: string;
    lines: Array<{
      lineId: string;
      quantity: number;
    }>;
  }) {
    return this.call<{
      data: DeliveryDto;
      message?: string;
    }>("b2b-sales-delivery.curd.create", payload);
  }
}

export const deliveryService = new DeliveryService();
