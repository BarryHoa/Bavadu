"use client";

import { SelectItemOption } from "@base/client/components";
import { useCreateUpdate } from "@base/client/hooks/useCreateUpdate";
import { IBaseButton } from "@base/client";
import { IBaseCard, IBaseCardBody } from "@base/client";
import { valibotResolver } from "@hookform/resolvers/valibot";
import { useRouter } from "next/navigation";
import { useForm, FormProvider } from "react-hook-form";
import { array, object, optional, pipe, string, trim } from "valibot";

import {
  priceListB2CService,
  type CreatePriceListB2CParams,
} from "../../services/PriceListB2CService";

import PriceListForm from "./components/PriceListForm";

const priceItemSchema = object({
  productId: pipe(string(), trim()),
  variantId: optional(pipe(string(), trim())),
  unitPrice: pipe(string(), trim()),
});

const priceListFormSchema = object({
  code: pipe(string(), trim()),
  name: object({
    en: optional(pipe(string(), trim())),
    vi: optional(pipe(string(), trim())),
  }),
  description: optional(pipe(string(), trim())),
  type: pipe(string(), trim()),
  status: pipe(string(), trim()),
  priority: optional(pipe(string(), trim())),
  currencyId: optional(pipe(string(), trim())),
  validFrom: pipe(string(), trim()),
  validTo: optional(pipe(string(), trim())),
  isDefault: optional(string()),
  applicableTo: object({
    channels: optional(array(string())),
    stores: optional(array(string())),
    locations: optional(array(string())),
    regions: optional(array(string())),
    customerGroups: optional(array(string())),
  }),
  priceItems: optional(array(priceItemSchema)),
});

type PriceListFormValues = {
  code: string;
  name: {
    en?: string;
    vi?: string;
  };
  description?: string;
  type: string;
  status: string;
  priority?: string;
  currencyId?: string;
  validFrom: string;
  validTo?: string;
  isDefault?: string;
  applicableTo: {
    channels?: string[];
    stores?: string[];
    locations?: string[];
    regions?: string[];
    customerGroups?: string[];
  };
  priceItems?: Array<{
    productId: string;
    variantId?: string;
    unitPrice: string;
  }>;
};

export default function PriceListB2CCreatePage(): React.ReactNode {
  const router = useRouter();
  const { mutate: createPriceList, isPending } = useCreateUpdate({
    mutationFn: async (data: CreatePriceListB2CParams) => {
      return await priceListB2CService.create(data);
    },
    onSuccess: () => {
      router.push("/workspace/modules/b2c-sales/price-lists");
    },
  });

  const methods = useForm<PriceListFormValues>({
    resolver: valibotResolver(priceListFormSchema) as any,
    defaultValues: {
      code: "",
      name: {
        en: "",
        vi: "",
      },
      description: "",
      type: "standard",
      status: "active",
      priority: "0",
      currencyId: undefined,
      validFrom: new Date().toISOString().split("T")[0],
      validTo: undefined,
      isDefault: "false",
      applicableTo: {
        channels: undefined,
        stores: undefined,
        locations: undefined,
        regions: undefined,
        customerGroups: undefined,
      },
      priceItems: [],
    },
  });

  const {
    control,
    setValue,
    handleSubmit,
    formState: { errors },
  } = methods;

  const onSubmit = (data: PriceListFormValues) => {
    const applicableTo: any = {};

    if (data.applicableTo.channels && data.applicableTo.channels.length > 0) {
      applicableTo.channels = data.applicableTo.channels;
    }
    if (data.applicableTo.stores && data.applicableTo.stores.length > 0) {
      applicableTo.stores = data.applicableTo.stores;
    }
    if (data.applicableTo.locations && data.applicableTo.locations.length > 0) {
      applicableTo.locations = data.applicableTo.locations;
    }
    if (data.applicableTo.regions && data.applicableTo.regions.length > 0) {
      applicableTo.regions = data.applicableTo.regions;
    }
    if (
      data.applicableTo.customerGroups &&
      data.applicableTo.customerGroups.length > 0
    ) {
      applicableTo.customerGroups = data.applicableTo.customerGroups;
    }

    const payload: CreatePriceListB2CParams = {
      code: data.code,
      name: {
        en: data.name.en || "",
        vi: data.name.vi || "",
      },
      description: data.description,
      type: data.type as any,
      status: data.status as any,
      priority: data.priority ? parseInt(data.priority) : 0,
      currencyId: data.currencyId,
      validFrom: data.validFrom,
      validTo: data.validTo || null,
      isDefault: data.isDefault === "true",
      applicableTo:
        Object.keys(applicableTo).length > 0 ? applicableTo : undefined,
    };

    // Add price items if any
    if (data.priceItems && data.priceItems.length > 0) {
      // Note: Price items will be created separately via API
      // For now, we'll just create the price list
    }

    createPriceList(payload);
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
  ];

  // Sample options for applicableTo (should be loaded from API in real app)
  const channelOptions: SelectItemOption[] = [
    { value: "online", label: "Online" },
    { value: "offline", label: "Offline" },
    { value: "mobile_app", label: "Mobile App" },
  ];

  const locationOptions: SelectItemOption[] = [
    { value: "hcm", label: "Ho Chi Minh City" },
    { value: "hn", label: "Hanoi" },
    { value: "dn", label: "Da Nang" },
  ];

  const regionOptions: SelectItemOption[] = [
    { value: "north", label: "North" },
    { value: "south", label: "South" },
    { value: "central", label: "Central" },
  ];

  const customerGroupOptions: SelectItemOption[] = [
    { value: "vip", label: "VIP" },
    { value: "regular", label: "Regular" },
  ];

  const storeOptions: SelectItemOption[] = [];
  const productOptions: SelectItemOption[] = [];

  return (
    <div className="space-y-4">
      <IBaseCard>
        <IBaseCardBody>
          <FormProvider {...methods}>
            <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
              <PriceListForm
                brandOptions={[]}
                categoryOptions={[]}
                channelOptions={channelOptions}
                control={control}
                customerGroupOptions={customerGroupOptions}
                errors={errors}
                locationOptions={locationOptions}
                productOptions={productOptions}
                regionOptions={regionOptions}
                setValue={setValue}
                statusOptions={statusOptions}
                storeOptions={storeOptions}
                typeOptions={typeOptions}
              />
              <div className="flex gap-2 justify-end pt-4">
                <IBaseButton
                  type="button"
                  variant="light"
                  onPress={() => router.back()}
                >
                  Cancel
                </IBaseButton>
                <IBaseButton color="primary" isLoading={isPending} type="submit">
                  Create
                </IBaseButton>
              </div>
            </form>
          </FormProvider>
        </IBaseCardBody>
      </IBaseCard>
    </div>
  );
}
