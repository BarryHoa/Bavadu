"use client";

import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";

import { useCreateUpdate } from "@base/client/hooks/useCreateUpdate";

import { salesOrderB2CService } from "../../../services/SalesOrderB2CService";
import SalesOrderB2CForm, {
  type SalesOrderB2CFormValues,
} from "../components/SalesOrderB2BForm/SalesOrderB2CForm";
import { SalesOrderB2BFormProvider } from "../contexts/SalesOrderB2BFormContext";

type SalesOrderB2CCreatePageClientProps = {
  currency: string;
  customerName: string;
  orderDate: string;
};

export default function SalesOrderB2CCreatePageClient({
  currency,
  customerName,
  orderDate,
}: SalesOrderB2CCreatePageClientProps): React.ReactNode {
  const router = useRouter();
  const t = useTranslations("b2cSales.order.create.labels");

  const {
    handleSubmit: submitOrder,
    error: submitError,
    isPending,
  } = useCreateUpdate<
    Parameters<typeof salesOrderB2CService.create>[0],
    { order: { id: string } }
  >({
    mutationFn: async (payload) => {
      const response = await salesOrderB2CService.create(payload);

      if (!response.data) {
        throw new Error(response.message ?? t("errors.failedToCreateOrder"));
      }

      return response.data;
    },
    invalidateQueries: [["b2c-sales-orders"]],
    onSuccess: (data) => {
      router.push(`/workspace/modules/b2c-sales/view/${data.order.id}`);
    },
  });

  const handleSubmit = async (values: SalesOrderB2CFormValues) => {
    const payload = {
      customerName: values.customerName.trim(),
      priceListId: values.priceListId?.trim() || undefined,
      deliveryAddress: values.deliveryAddress?.trim() || undefined,
      paymentMethodId: values.paymentMethodId?.trim() || undefined,
      shippingMethodId: values.shippingMethodId?.trim() || undefined,
      shippingTermsId: values.shippingTermsId?.trim() || undefined,
      requireInvoice: values.requireInvoice || false,
      warehouseId: values.warehouseId?.trim() || undefined,
      expectedDate: values.expectedDate?.trim() || undefined,
      currency: currency,
      notes: values.notes?.trim() || undefined,
      totalDiscount: values.totalDiscount
        ? Number(values.totalDiscount)
        : undefined,
      totalTax: values.totalTax ? Number(values.totalTax) : undefined,
      shippingFee: values.shippingFee ? Number(values.shippingFee) : undefined,
      lines: values.lines
        .map((line) => ({
          productId: line.productId.trim(),
          unitId: line.unitId?.trim() || undefined,
          quantity: Number(line.quantity),
          unitPrice: line.unitPrice ? Number(line.unitPrice) : undefined,
          description: line.description?.trim() || undefined,
          lineDiscount: line.lineDiscount
            ? Number(line.lineDiscount)
            : undefined,
          taxRate: line.taxRate ? Number(line.taxRate) : undefined,
        }))
        .filter((line) => line.productId && line.quantity > 0),
    };

    await submitOrder(payload);
  };

  return (
    <SalesOrderB2BFormProvider page="create">
      <SalesOrderB2CForm
        defaultValues={{
          currency,
          customerName,
        }}
        isSubmitting={isPending}
        submitError={submitError}
        onCancel={() => router.push("/workspace/modules/b2c-sales")}
        onSubmit={handleSubmit}
      />
    </SalesOrderB2BFormProvider>
  );
}
