import ClientHttpService from "@base/client/services/ClientHttpService";

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

export default class DeliveryService extends ClientHttpService {
  constructor() {
    super("/api/modules/sale/deliveries");
  }

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
    return this.post<{
      data: DeliveryDto;
      message?: string;
    }>("/create", payload);
  }
}

export const deliveryService = new DeliveryService();

