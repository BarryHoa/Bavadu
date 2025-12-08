"use client";

import {
  DataTable,
  DataTableColumn,
  IBaseInput,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
} from "@base/client/components";
import { Button } from "@heroui/button";
import { Checkbox, useDisclosure } from "@heroui/react";
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
    [setValue, setSelectedCustomer, onCustomerModalClose]
  );

  const customerColumns = useMemo<DataTableColumn<CustomerIndividualDto>[]>(
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
          <Button
            size="sm"
            color="primary"
            onPress={() => handleSelectCustomer(row)}
          >
            Chọn
          </Button>
        ),
      },
    ],
    [handleSelectCustomer]
  );

  return (
    <>
      <div>
        <h2 className="text-base font-semibold mb-2">{t("customerInfo")}</h2>
        <div className=" flex flex-col space-y-3">
          <div>
            <Controller
              name="requireInvoice"
              control={control}
              render={({ field }) => (
                <Checkbox
                  size="sm"
                  isSelected={field.value}
                  onValueChange={field.onChange}
                >
                  {t("requireInvoice")}
                </Checkbox>
              )}
            />
          </div>

          <div className="flex gap-2 justify-between items-end">
            <div className="flex-1">
              <Controller
                name="customerName"
                control={control}
                render={({ field, fieldState }) => (
                  <div className="space-y-1">
                    <div className="flex gap-2">
                      <IBaseInput
                        {...field}
                        size="sm"
                        value={field.value}
                        onValueChange={field.onChange}
                        label={t("customerName")}
                        isRequired
                        isInvalid={fieldState.invalid}
                        errorMessage={fieldState.error?.message}
                        className="flex-1"
                        endContent={
                          isCustomerNotDefault ? (
                            <RefreshCwIcon
                              size={16}
                              className="text-primary cursor-pointer hover:text-orange-500"
                              onClick={handleResetCustomer}
                            />
                          ) : null
                        }
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
            <Button
              size="sm"
              variant="solid"
              onPress={onCustomerModalOpen}
              color="primary"
            >
              {t("selectCustomer")}
            </Button>
          </div>
        </div>
      </div>

      {/* Customer Selection Modal */}
      <Modal
        isOpen={isCustomerModalOpen}
        onClose={onCustomerModalClose}
        size="3xl"
        scrollBehavior="inside"
      >
        <ModalContent>
          <ModalHeader>{t("selectCustomer")}</ModalHeader>
          <ModalBody>
            <DataTable
              columns={customerColumns}
              dataSource={customersQuery.data ?? []}
              rowKey="id"
              pagination={{ pageSize: 10, page: 1 }}
              loading={customersQuery.isLoading}
            />
          </ModalBody>
          <ModalFooter>
            <Button variant="light" onPress={onCustomerModalClose}>
              {t("close")}
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
}
