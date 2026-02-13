"use client";

import type { DepartmentFormValues } from "../../validation/departmentValidation";

import {
  IBaseButton,
  IBaseCard,
  IBaseCardBody,
  IBaseSwitch,
} from "@base/client";
import {
  IBaseAccordion,
  IBaseAccordionItem,
  IBaseInput,
  IBaseInputMultipleLang,
  IBaseSingleSelectAsync,
} from "@base/client/components";
import { valibotResolver } from "@hookform/resolvers/valibot";
import { useTranslations } from "next-intl";
import { Controller, useForm, type SubmitHandler } from "react-hook-form";

import { createDepartmentValidation } from "../../validation/departmentValidation";

export type { DepartmentFormValues };

interface DepartmentFormProps {
  onSubmit: (values: DepartmentFormValues) => Promise<void>;
  onCancel?: () => void;
  isSubmitting?: boolean;
  submitError?: string | null;
  defaultValues?: Partial<DepartmentFormValues>;
  /** Designlab #16: Use descriptive, action-based button text */
  mode?: "create" | "edit";
}

export default function DepartmentForm({
  onSubmit,
  onCancel,
  isSubmitting = false,
  submitError,
  defaultValues,
  mode = "create",
}: DepartmentFormProps) {
  const t = useTranslations("hrm.department.create.validation");
  const tLabels = useTranslations("hrm.department.create.labels");

  // React Compiler will automatically optimize this computation
  const validation = createDepartmentValidation(t);

  const { control, handleSubmit } = useForm<DepartmentFormValues>({
    resolver: valibotResolver(validation.departmentFormSchema) as any,
    defaultValues: {
      isActive: true,
      ...defaultValues,
    },
  });

  const onSubmitForm: SubmitHandler<DepartmentFormValues> = async (values) => {
    await onSubmit(values);
  };

  return (
    <form className="flex flex-col gap-6" onSubmit={handleSubmit(onSubmitForm)}>
      {/* NN/G: Highly visible error - outline + red + font weight */}
      {submitError ? (
        <div
          aria-live="polite"
          className="rounded-xl border-2 border-danger-300 bg-danger-50 px-4 py-3 text-sm font-semibold text-danger-700 shadow-sm"
        >
          {submitError}
        </div>
      ) : null}

      <IBaseCard className="border border-default-200/60 shadow-sm">
        <IBaseCardBody className="gap-5 px-4 py-4 md:p-5">
          {/* Designlab #4,5: Group headline + logical/visual grouping */}
          <div>
            <h2 className="text-lg font-semibold text-foreground">
              {tLabels("basicInfo")}
            </h2>
          </div>

          {/* NN/G: Single-column, ~32px between fields (gap-8) */}
          <div className="flex flex-col gap-8">
            {/* Identifiers - required first (Designlab #3: easiest first) */}
            <Controller
              control={control}
              name="code"
              render={({ field, fieldState }) => (
                <IBaseInput
                  {...field}
                  isRequired
                  errorMessage={fieldState.error?.message}
                  isInvalid={fieldState.invalid}
                  label={tLabels("code")}
                  size="sm"
                />
              )}
            />
            <Controller
              control={control}
              name="name"
              render={({ field, fieldState }) => (
                <IBaseInputMultipleLang
                  isRequired
                  errorMessage={fieldState.error?.message}
                  isInvalid={fieldState.invalid}
                  label={tLabels("name")}
                  size="sm"
                  value={field.value || { vi: "", en: "" }}
                  onValueChange={field.onChange}
                />
              )}
            />

            {/* Designlab #10: Visual separation between groups */}
            <div className="my-1 border-t border-default-200" />

            {/* Hierarchy - Parent + Level grouped horizontally on desktop (Medium: related inputs) */}
            <div className="grid gap-4 md:grid-cols-2">
              <Controller
                control={control}
                name="parentId"
                render={({ field, fieldState }) => (
                  <div className="flex flex-col gap-1">
                    <IBaseSingleSelectAsync
                      errorMessage={fieldState.error?.message}
                      isInvalid={fieldState.invalid}
                      label={tLabels("parentDepartment")}
                      model="department.dropdown"
                      selectedKey={field.value}
                      size="sm"
                      onSelectionChange={(key) => {
                        field.onChange(key || undefined);
                      }}
                    />
                    <p className="text-xs text-default-500">
                      {tLabels("parentDepartmentHelper")}
                    </p>
                  </div>
                )}
              />
              <Controller
                control={control}
                name="level"
                render={({ field, fieldState }) => (
                  <div className="flex flex-col gap-1">
                    <IBaseInput
                      {...field}
                      errorMessage={fieldState.error?.message}
                      isInvalid={fieldState.invalid}
                      label={tLabels("level")}
                      size="sm"
                      type="number"
                    />
                    <p className="text-xs text-default-500">
                      {tLabels("levelHelper")}
                    </p>
                  </div>
                )}
              />
            </div>

            <div className="my-1 border-t border-default-200" />

            {/* P3: Progressive disclosure - Manager & Description in collapsible section */}
            <IBaseAccordion
              selectionMode="single"
              defaultExpandedKeys={[]}
              itemClasses={{ base: "py-0" }}
              variant="light"
            >
              <IBaseAccordionItem
                key="additional"
                aria-label={tLabels("additionalDetails")}
                title={tLabels("additionalDetails")}
                classNames={{ content: "pb-2 pt-0" }}
              >
                <div className="flex flex-col gap-4">
                  <Controller
                    control={control}
                    name="managerId"
                    render={({ field, fieldState }) => (
                      <IBaseSingleSelectAsync
                        errorMessage={fieldState.error?.message}
                        isInvalid={fieldState.invalid}
                        label={tLabels("manager")}
                        model="employee.dropdown"
                        selectedKey={field.value}
                        size="sm"
                        onSelectionChange={(key) => {
                          field.onChange(key || undefined);
                        }}
                      />
                    )}
                  />
                  <Controller
                    control={control}
                    name="description"
                    render={({ field, fieldState }) => (
                      <IBaseInputMultipleLang
                        errorMessage={fieldState.error?.message}
                        isInvalid={fieldState.invalid}
                        label={tLabels("description")}
                        size="sm"
                        value={field.value || { vi: "", en: "" }}
                        onValueChange={field.onChange}
                      />
                    )}
                  />
                </div>
              </IBaseAccordionItem>
            </IBaseAccordion>

            {/* Designlab #9: Vertical arrangement for switch */}
            <Controller
              control={control}
              name="isActive"
              render={({ field }) => (
                <div className="flex items-center gap-3 pt-1">
                  <IBaseSwitch
                    isSelected={field.value ?? true}
                    onValueChange={field.onChange}
                  />
                  <span className="text-sm font-medium text-foreground">
                    {tLabels("isActive")}
                  </span>
                </div>
              )}
            />
          </div>

          {/* Designlab #16: Descriptive, action-based button text; Full-page form: primary left, cancel next (Adam Silver, PatternFly) */}
          <div className="flex flex-wrap items-center gap-3 pt-6 border-t border-default-200">
            <IBaseButton
              color="primary"
              disabled={isSubmitting}
              isLoading={isSubmitting}
              size="md"
              type="submit"
            >
              {mode === "create"
                ? tLabels("saveCreate")
                : tLabels("saveUpdate")}
            </IBaseButton>
            {onCancel && (
              <IBaseButton size="md" variant="light" onPress={onCancel}>
                {tLabels("cancel")}
              </IBaseButton>
            )}
          </div>
        </IBaseCardBody>
      </IBaseCard>
    </form>
  );
}
