"use client";

import Input from "@base/client/components/Input";
import { Button } from "@heroui/button";
import { Card, CardBody, Switch, Textarea } from "@heroui/react";
import { Save } from "lucide-react";
import { FormEvent, useEffect, useState } from "react";

export type ProductCategoryFormValues = {
  name: string;
  code: string;
  description?: string;
  parentId?: string;
  level?: number | null;
  isActive: boolean;
};

interface ProductCategoryFormProps {
  title: string;
  subtitle?: string;
  submitLabel?: string;
  secondarySubmitLabel?: string;
  initialValues?: ProductCategoryFormValues;
  loading?: boolean;
  error?: string | null;
  onSubmit: (values: ProductCategoryFormValues) => Promise<void> | void;
  onSubmitAndContinue?: (
    values: ProductCategoryFormValues
  ) => Promise<void> | void;
  onCancel?: () => void;
}

const defaultValues: ProductCategoryFormValues = {
  name: "",
  code: "",
  description: "",
  parentId: "",
  level: null,
  isActive: true,
};

export default function ProductCategoryForm({
  title,
  subtitle,
  submitLabel = "Save",
  secondarySubmitLabel = "Save & add another",
  initialValues,
  loading = false,
  error,
  onSubmit,
  onSubmitAndContinue,
  onCancel,
}: ProductCategoryFormProps) {
  const [values, setValues] = useState<ProductCategoryFormValues>(
    initialValues ?? defaultValues
  );

  useEffect(() => {
    setValues(
      initialValues ? { ...defaultValues, ...initialValues } : defaultValues
    );
  }, [initialValues]);

  const buildPayload = (): ProductCategoryFormValues => ({
    ...values,
    name: values.name.trim(),
    code: values.code.trim(),
    description: values.description?.trim() || undefined,
    parentId: values.parentId?.trim() || undefined,
    level:
      values.level === null || values.level === undefined
        ? null
        : Number(values.level),
  });

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    try {
      await onSubmit(buildPayload());
    } catch (submitError) {
      console.error(submitError);
    }
  };

  const handleSubmitAndContinue = async () => {
    if (!onSubmitAndContinue) return;
    try {
      await onSubmitAndContinue(buildPayload());
      setValues(defaultValues);
    } catch (submitError) {
      console.error(submitError);
    }
  };

  const levelValue =
    values.level === null || values.level === undefined
      ? ""
      : String(values.level);

  return (
    <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
      <Card>
        <CardBody className="space-y-4">
          <div>
            <h1 className="text-xl font-semibold">{title}</h1>
            {subtitle ? (
              <p className="text-default-500 text-small">{subtitle}</p>
            ) : null}
          </div>

          <Input
            label="Name"
            placeholder="Electronics"
            value={values.name}
            onValueChange={(val) =>
              setValues((prev) => ({ ...prev, name: val }))
            }
            variant="bordered"
            isRequired
            isDisabled={loading}
          />

          <Input
            label="Code"
            placeholder="CAT-001"
            value={values.code}
            onValueChange={(val) =>
              setValues((prev) => ({ ...prev, code: val }))
            }
            variant="bordered"
            isRequired
            isDisabled={loading}
          />

          <Input
            label="Parent ID"
            placeholder="Parent category ID"
            value={values.parentId ?? ""}
            onValueChange={(val) =>
              setValues((prev) => ({ ...prev, parentId: val }))
            }
            variant="bordered"
            isDisabled={loading}
          />

          <Input
            label="Level"
            placeholder="1"
            type="number"
            value={levelValue}
            onValueChange={(val) => {
              const numeric = Number(val);
              setValues((prev) => ({
                ...prev,
                level: val === "" || Number.isNaN(numeric) ? null : numeric,
              }));
            }}
            variant="bordered"
            isDisabled={loading}
          />

          <Textarea
            label="Description"
            placeholder="Write a short description"
            value={values.description ?? ""}
            onValueChange={(val) =>
              setValues((prev) => ({ ...prev, description: val }))
            }
            variant="bordered"
            minRows={3}
            isDisabled={loading}
          />

          <Switch
            isSelected={values.isActive}
            onValueChange={(checked) =>
              setValues((prev) => ({ ...prev, isActive: checked }))
            }
            isDisabled={loading}
          >
            Active
          </Switch>

          {error ? (
            <p className="text-sm text-danger-500" role="alert">
              {error}
            </p>
          ) : null}

          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-end">
            {onCancel ? (
              <Button
                variant="light"
                size="sm"
                onPress={onCancel}
                isDisabled={loading}
              >
                Cancel
              </Button>
            ) : null}

            {onSubmitAndContinue ? (
              <Button
                variant="bordered"
                size="sm"
                type="button"
                onPress={handleSubmitAndContinue}
                isDisabled={loading}
              >
                {secondarySubmitLabel}
              </Button>
            ) : null}

            <Button
              color="primary"
              size="sm"
              endContent={<Save size={16} />}
              type="submit"
              isLoading={loading}
            >
              {submitLabel}
            </Button>
          </div>
        </CardBody>
      </Card>
    </form>
  );
}
