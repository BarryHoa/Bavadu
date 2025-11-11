/* eslint-disable react-hooks/exhaustive-deps */
"use client";

import Input from "@base/client/components/Input";
import LinkAs from "@base/client/components/LinkAs";
import { Button } from "@heroui/button";
import { Card, CardBody, Checkbox } from "@heroui/react";
import { valibotResolver } from "@hookform/resolvers/valibot";
import { useRouter } from "next/navigation";
import { Controller, useForm } from "react-hook-form";
import { boolean, minLength, object, optional, pipe, string, trim } from "valibot";

import StockService from "../../services/StockService";

const warehouseFormSchema = object({
  code: pipe(string(), trim(), minLength(1, "Code is required")),
  name: pipe(string(), trim(), minLength(1, "Name is required")),
  description: optional(pipe(string(), trim())),
  isActive: boolean(),
});

type WarehouseFormValues = {
  code: string;
  name: string;
  description?: string;
  isActive: boolean;
};

export default function WarehouseCreatePage(): React.ReactNode {
  const router = useRouter();

  const { control, handleSubmit, formState: { isSubmitting }, reset } =
    useForm<WarehouseFormValues>({
    resolver: valibotResolver(warehouseFormSchema),
    defaultValues: {
      code: "",
      name: "",
      description: "",
      isActive: true,
    },
    });

  const onSubmit = async (values: WarehouseFormValues) => {
    await StockService.createWarehouse({
      code: values.code.trim(),
      name: values.name.trim(),
      description: values.description?.trim() || undefined,
      isActive: values.isActive,
    });

    reset();
    router.push("/workspace/modules/stock/warehouses");
  };

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Create Warehouse</h1>
          <p className="text-default-500">
            Define the basic information for a new warehouse.
          </p>
        </div>
        <Button
          as={LinkAs as any}
          size="sm"
          variant="light"
          href="/workspace/modules/stock/warehouses"
        >
          Back to list
        </Button>
      </div>

      <Card>
        <CardBody>
          <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
            <Controller
              name="code"
              control={control}
              render={({ field, fieldState }) => (
                <Input
                  {...field}
                  label="Code"
                  placeholder="Unique warehouse code"
                  value={field.value}
                  onValueChange={field.onChange}
                  isRequired
                  isInvalid={fieldState.invalid}
                  errorMessage={fieldState.error?.message}
                />
              )}
            />
            <Controller
              name="name"
              control={control}
              render={({ field, fieldState }) => (
                <Input
                  {...field}
                  label="Name"
                  placeholder="Warehouse name"
                  value={field.value}
                  onValueChange={field.onChange}
                  isRequired
                  isInvalid={fieldState.invalid}
                  errorMessage={fieldState.error?.message}
                />
              )}
            />
            <Controller
              name="description"
              control={control}
              render={({ field, fieldState }) => (
                <Input
                  {...field}
                  label="Description"
                  placeholder="Optional description"
                  value={field.value ?? ""}
                  onValueChange={field.onChange}
                  isInvalid={fieldState.invalid}
                  errorMessage={fieldState.error?.message}
                />
              )}
            />
            <Controller
              name="isActive"
              control={control}
              render={({ field }) => (
                <Checkbox
                  isSelected={field.value}
                  onValueChange={field.onChange}
                >
                  Active
                </Checkbox>
              )}
            />

            <div className="flex items-center gap-3">
              <Button
                color="primary"
                type="submit"
                isLoading={isSubmitting}
                disabled={isSubmitting}
              >
                Create
              </Button>
            </div>
          </form>
        </CardBody>
      </Card>
    </div>
  );
}

