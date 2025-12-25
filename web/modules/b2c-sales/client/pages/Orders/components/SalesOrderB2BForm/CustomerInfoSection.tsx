"use client";

import { IBaseTable, IBaseTableColumnDefinition, IBaseInput, IBaseModal, IBaseModalBody, IBaseModalContent, IBaseModalFooter, IBaseModalHeader,  } from "@base/client/components";
import { IBaseButton } from "@base/client";
import { IBaseCheckbox, useDisclosure } from "@base/client";
import { useQuery } from "@tanstack/react-query";
import { RefreshCwIcon } from "lucide-react";
import { useTranslations } from "next-intl";
import { useCallback, useMemo } from "react";
import { Control, Controller, useWatch } from "react-hook-form";

import {
  customerService,
  type CustomerIndividualDto,
} from "../../../../services/CustomerService";

interface CustomerInfoSectionProps {
  control: Control<any>;
  setValue: any;
  selectedCustomer: CustomerIndividualDto | null;
  setSelectedCustomer: (customer: CustomerIndividualDto | null) => void;
  errors?: any;
}

const DEFAULT_CUSTOMER_NAME = "Khách lẻ";

export default function CustomerInfoSection({
  control,
  setValue,
  selectedCustomer,
  setSelectedCustomer,
  errors,
}: CustomerInfoSectionProps) {
  const t = useTranslations("b2cSales.order.create.labels");
  const {
    isOpen: isCustomerModalOpen,
    onOpen: onCustomerModalOpen,
    onClose: onCustomerModalClose,
  } = useDisclosure();
  const watchedCustomerName =
    useWatch({ control, name: "customerName" }) || DEFAULT_CUSTOMER_NAME;
  const isCustomerNotDefault = watchedCustomerName !== DEFAULT_CUSTOMER_NAME;

  const customersQuery = useQuery({
    queryKey: ["customer-individuals"],
    queryFn: async () => {
      const response = await customerService.listIndividuals();

      return response.data ?? [];
    },
    enabled: isCustomerModalOpen,
  });

  const handleResetCustomer = useCallback(() => {
    setValue("customerName", DEFAULT_CUSTOMER_NAME);
    setSelectedCustomer(null);
  }, [setValue, setSelectedCustomer]);

  const handleSelectCustomer = useCallback(
    (customer: CustomerIndividualDto) => {
      const fullName = `${customer.firstName} ${customer.lastName}`.trim();

      setValue("customerName", fullName);
      setSelectedCustomer(customer);
      onCustomerModalClose();
    },
    [setValue, setSelectedCustomer, onCustomerModalClose],
  );

  const customerColumns = useMemo<IBaseTableColumnDefinition<CustomerIndividualDto>[]>(
    () => [
      {
        key: "code",
        label: t("code"),
      },
      {
        key: "name",
        label: t("name"),
        render: (_, row) => `${row.firstName} ${row.lastName}`,
      },
      {
        key: "phone",
        label: t("phone"),
      },
      {
        key: "actions",
        label: t("actions"),
        render: (_, row) => (
          <IBaseButton
            color="primary"
            size="sm"
            onPress={() => handleSelectCustomer(row)}
          >
            Chọn
          </IBaseButton>
        ),
      },
    ],
    [handleSelectCustomer],
  );

  return (
    <>
      <div>
        <h2 className="text-base font-semibold mb-2">{t("customerInfo")}</h2>
        <div className=" flex flex-col space-y-3">
          <div>
            <Controller
              control={control}
              name="requireInvoice"
              render={({ field }) => (
                <IBaseCheckbox
                  isSelected={field.value}
                  size="sm"
                  onValueChange={field.onChange}
                >
                  {t("requireInvoice")}
                </IBaseCheckbox>
              )}
            />
          </div>

          <div className="flex gap-2 justify-between items-end">
            <div className="flex-1">
              <Controller
                control={control}
                name="customerName"
                render={({ field, fieldState }) => (
                  <div className="space-y-1">
                    <div className="flex gap-2">
                      <IBaseInput
                        {...field}
                        isRequired
                        className="flex-1"
                        endContent={
                          isCustomerNotDefault ? (
                            <RefreshCwIcon
                              className="text-primary cursor-pointer hover:text-orange-500"
                              size={16}
                              onClick={handleResetCustomer}
                            />
                          ) : null
                        }
                        errorMessage={fieldState.error?.message}
                        isInvalid={fieldState.invalid}
                        label={t("customerName")}
                        size="sm"
                        value={field.value}
                        onValueChange={field.onChange}
                      />
                    </div>
                  </div>
                )}
              />
              {selectedCustomer?.phone && (
                <p className="text-xs text-default-500">
                  Số điện thoại: {selectedCustomer.phone}
                </p>
              )}
            </div>
            <IBaseButton
              color="primary"
              size="sm"
              variant="solid"
              onPress={onCustomerModalOpen}
            >
              {t("selectCustomer")}
            </IBaseButton>
          </div>
        </div>
      </div>

      {/* Customer Selection IBaseModal */}
      <IBaseModal
        isOpen={isCustomerModalOpen}
        scrollBehavior="inside"
        size="3xl"
        onClose={onCustomerModalClose}
      >
        <IBaseModalContent>
          <IBaseModalHeader>{t("selectCustomer")}</IBaseModalHeader>
          <IBaseModalBody>
            <IBaseTable
              columns={customerColumns}
              dataSource={customersQuery.data ?? []}
              loading={customersQuery.isLoading}
              pagination={{ pageSize: 10, page: 1 }}
              rowKey="id"
            />
          </IBaseModalBody>
          <IBaseModalFooter>
            <IBaseButton variant="light" onPress={onCustomerModalClose}>
              {t("close")}
            </IBaseButton>
          </IBaseModalFooter>
        </IBaseModalContent>
      </IBaseModal>
    </>
  );
}
