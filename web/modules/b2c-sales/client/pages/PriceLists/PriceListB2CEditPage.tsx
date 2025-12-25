"use client";

import { SelectItemOption } from "@base/client/components";
import { useCreateUpdate } from "@base/client/hooks/useCreateUpdate";
import { IBaseButton } from "@base/client";
import { IBaseCard, IBaseCardBody } from "@base/client";
import { valibotResolver } from "@hookform/resolvers/valibot";
import { useQuery } from "@tanstack/react-query";
import { useParams, useRouter } from "next/navigation";
import { useForm, FormProvider } from "react-hook-form";
import { object, optional, pipe, string, trim } from "valibot";

import {
  priceListB2CService,
  type UpdatePriceListB2CParams,
} from "../../services/PriceListB2CService";

import PriceListForm from "./components/PriceListForm";

const priceListFormSchema = object({
  code: pipe(string(), trim()),
  nameEn: pipe(string(), trim()),
  nameVi: pipe(string(), trim()),
  description: optional(pipe(string(), trim())),
  type: pipe(string(), trim()),
  status: pipe(string(), trim()),
  priority: optional(pipe(string(), trim())),
  currencyId: optional(pipe(string(), trim())),
  validFrom: pipe(string(), trim()),
  validTo: optional(pipe(string(), trim())),
  isDefault: optional(string()),
  applicableTo: object({
    channels: optional(string()),
    stores: optional(string()),
    locations: optional(string()),
    regions: optional(string()),
    customerGroups: optional(string()),
  }),
});

type PriceListFormValues = {
  code: string;
  nameEn: string;
  nameVi: string;
  description?: string;
  type: string;
  status: string;
  priority?: string;
  currencyId?: string;
  validFrom: string;
  validTo?: string;
  isDefault?: string;
  applicableTo: {
    channels?: string;
    stores?: string;
    locations?: string;
    regions?: string;
    customerGroups?: string;
  };
};

export default function PriceListB2CEditPage(): React.ReactNode {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;

  const { data: priceList, isLoading } = useQuery({
    queryKey: ["price-list-b2c", id],
    queryFn: async () => {
      const response = await priceListB2CService.getById(id);

      return response.data;
    },
    enabled: !!id,
  });

  const { mutate: updatePriceList, isPending } = useCreateUpdate({
    mutationFn: async (data: UpdatePriceListB2CParams) => {
      return await priceListB2CService.update(data);
    },
    onSuccess: () => {
      router.push("/workspace/modules/b2c-sales/price-lists");
    },
  });

  const name =
    typeof priceList?.name === "object" ? priceList.name : { en: "", vi: "" };

  const methods = useForm<PriceListFormValues>({
    resolver: valibotResolver(priceListFormSchema) as any,
    defaultValues: {
      code: "",
      nameEn: "",
      nameVi: "",
      description: "",
      type: "standard",
      status: "active",
      priority: "0",
      currencyId: undefined,
      validFrom: new Date().toISOString().split("T")[0],
      validTo: undefined,
      isDefault: "false",
      applicableTo: {
        channels: "",
        stores: "",
        locations: "",
        regions: "",
        customerGroups: "",
      },
    },
  });

  const {
    control,
    setValue,
    handleSubmit,
    formState: { errors },
    reset,
  } = methods;

  // Reset form when priceList loads
  if (priceList && !isLoading) {
    const applicableTo = priceList.applicableTo || {};

    reset({
      code: priceList.code,
      nameEn: name.en || "",
      nameVi: name.vi || "",
      description: priceList.description || "",
      type: priceList.type,
      status: priceList.status,
      priority: String(priceList.priority),
      currencyId: priceList.currencyId || undefined,
      validFrom: priceList.validFrom
        ? new Date(priceList.validFrom).toISOString().split("T")[0]
        : new Date().toISOString().split("T")[0],
      validTo: priceList.validTo
        ? new Date(priceList.validTo).toISOString().split("T")[0]
        : undefined,
      isDefault: priceList.isDefault ? "true" : "false",
      applicableTo: {
        channels: applicableTo.channels?.join(", ") || "",
        stores: applicableTo.stores?.join(", ") || "",
        locations: applicableTo.locations?.join(", ") || "",
        regions: applicableTo.regions?.join(", ") || "",
        customerGroups: applicableTo.customerGroups?.join(", ") || "",
      },
    });
  }

  const onSubmit = (data: PriceListFormValues) => {
    const applicableTo: any = {};

    if (data.applicableTo.channels) {
      applicableTo.channels = data.applicableTo.channels
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);
    }
    if (data.applicableTo.stores) {
      applicableTo.stores = data.applicableTo.stores
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);
    }
    if (data.applicableTo.locations) {
      applicableTo.locations = data.applicableTo.locations
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);
    }
    if (data.applicableTo.regions) {
      applicableTo.regions = data.applicableTo.regions
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);
    }
    if (data.applicableTo.customerGroups) {
      applicableTo.customerGroups = data.applicableTo.customerGroups
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);
    }

    updatePriceList({
      id,
      name: { en: data.nameEn, vi: data.nameVi },
      description: data.description,
      type: data.type as any,
      status: data.status as any,
      priority: data.priority ? parseInt(data.priority) : undefined,
      currencyId: data.currencyId,
      validFrom: data.validFrom,
      validTo: data.validTo || null,
      isDefault: data.isDefault === "true",
      applicableTo,
    });
  };

  const typeOptions: SelectItemOption[] = [
    { value: "standard", label: "Standard" },
    { value: "promotion", label: "Promotion" },
    { value: "seasonal", label: "Seasonal" },
    { value: "flash_sale", label: "Flash Sale" },
  ];

  const statusOptions: SelectItemOption[] = [
    { value: "draft", label: "Draft" },
    { value: "active", label: "Active" },
    { value: "inactive", label: "Inactive" },
    { value: "expired", label: "Expired" },
  ];

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (!priceList) {
    return <div>Price list not found</div>;
  }

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Edit Price List</h1>
      <IBaseCard>
        <IBaseCardBody>
          <FormProvider {...methods}>
            <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
              <PriceListForm
                control={control}
                errors={errors}
                isEdit={true}
                setValue={setValue}
                statusOptions={statusOptions}
                typeOptions={typeOptions}
              />
              <div className="flex gap-2 justify-end">
                <IBaseButton
                  type="button"
                  variant="light"
                  onPress={() => router.back()}
                >
                  Cancel
                </IBaseButton>
                <IBaseButton color="primary" isLoading={isPending} type="submit">
                  Update
                </IBaseButton>
              </div>
            </form>
          </FormProvider>
        </IBaseCardBody>
      </IBaseCard>
    </div>
  );
}
