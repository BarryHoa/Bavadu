"use client";

import type { Resolver, SubmitHandler } from "react-hook-form";
import type { VariantFieldValue } from "./types";

import { IBaseButton, IBaseCard, IBaseTab } from "@base/client/components";
import {
  IBaseCardBody,
  IBaseTabs,
  IBaseTooltip,
  SelectItemOption,
} from "@base/client/components";
import { useLocalizedText } from "@base/client/hooks/useLocalizedText";
import { valibotResolver } from "@hookform/resolvers/valibot";
import { useQuery } from "@tanstack/react-query";
import { HelpCircle, Plus } from "lucide-react";
import { useTranslations } from "next-intl";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  FormProvider,
  useFieldArray,
  useForm,
  useWatch,
} from "react-hook-form";
import { MediaService } from "@base/client/services";

import {
  ProductFormValues,
  ProductMasterFeatures,
  ProductMasterType,
} from "../../../interface/Product";
import ProductCategoryService from "../../../services/ProductCategoryService";
import ProductService from "../../../services/ProductService";
import { FORBIDDEN_FEATURES_BY_TYPE } from "../../../utils/product-features-validator";

import MasterTab from "./MasterTab";
import ProductFormGuideModal from "./ProductFormGuideModal";
import VariantTab from "./VariantTab";
import {
  createDefaultValues,
  createDefaultVariant,
  mapToFieldValues,
  mapToProductFormValues,
  type ProductFormFieldValues,
} from "./mappers";
import { buildHierarchyOptions, getFeaturesByProductType } from "./utils";
import { createProductFormSchema } from "./validation";

interface ProductFormProps {
  submitLabel?: string;
  secondarySubmitLabel?: string;
  loading?: boolean;
  initialValues?: ProductFormValues;
  onSubmit: (values: ProductFormValues) => Promise<void> | void;
  onSubmitAndContinue?: (values: ProductFormValues) => Promise<void> | void;
  onCancel?: () => void;
}

export default function ProductForm({
  submitLabel,
  secondarySubmitLabel,
  loading = false,
  initialValues,
  onSubmit,
  onSubmitAndContinue,
  onCancel,
}: ProductFormProps) {
  const getLocalizedText = useLocalizedText();
  const t = useTranslations("common");
  const tProduct = useTranslations("mdl-product");
  const tProductForm = useTranslations("mdl-product.product-create");

  // Helper to format messages with variables
  // next-intl's useTranslations supports variables as second parameter
  const formatMessage = useCallback(
    (key: string, values: Record<string, string | number>) => {
      // Type assertion to allow passing variables to next-intl translation function
      const tWithVars = tProductForm as unknown as (
        key: string,
        values?: Record<string, string | number>,
      ) => string;

      return tWithVars(key, values);
    },
    [tProductForm],
  );

  const productFeaturesQuery = useQuery({
    queryKey: ["product-features"],
    queryFn: () => ProductService.getProductFeatures(),
  });

  const featureOptions = useMemo(() => {
    if (!productFeaturesQuery.data?.data) {
      return [];
    }

    return productFeaturesQuery.data.data.map((option: any) => {
      return {
        value: option.value as ProductMasterFeatures,
        label: getLocalizedText(option.label as any) as string,
      };
    });
  }, [productFeaturesQuery.data]);

  const form = useForm<ProductFormFieldValues>({
    defaultValues: mapToFieldValues(initialValues, featureOptions),
    resolver: valibotResolver(
      createProductFormSchema(t, tProduct, tProductForm, formatMessage),
    ) as unknown as Resolver<ProductFormFieldValues>,
    mode: "onSubmit", // Only validate on submit initially
    reValidateMode: "onChange", // After submit, re-validate on change for fields with errors
    shouldFocusError: true, // Auto focus first error field on submit
  });

  const {
    handleSubmit,
    reset,
    control,
    setValue,
    getValues,
    trigger,
    setFocus,
    formState: { errors, isSubmitting, isSubmitted },
  } = form;

  // Use useFieldArray for managing variants array
  const {
    fields: variantFields,
    append: appendVariant,
    remove: removeVariant,
    update: updateVariantField,
  } = useFieldArray({
    control,
    name: "variants",
  });

  useEffect(() => {
    reset(mapToFieldValues(initialValues, featureOptions));
  }, [initialValues, reset, featureOptions]);

  const categoryQuery = useQuery({
    queryKey: ["product-category-tree"],
    queryFn: () => ProductCategoryService.fetchTree(),
  });

  const categoryOptions = useMemo<SelectItemOption[]>(() => {
    if (!categoryQuery.data) return [];
    const categories = Array.isArray(categoryQuery.data)
      ? categoryQuery.data
      : [];

    return buildHierarchyOptions(categories).map((option) => ({
      value: option.id,
      label: option.label,
    }));
  }, [categoryQuery.data]);

  // Watch only specific fields instead of entire form to improve performance
  const masterCode = useWatch({ control, name: "master.code" });
  const masterType = useWatch({ control, name: "master.type" });
  const masterName = useWatch({ control, name: "master.name" });
  const masterCategoryId = useWatch({ control, name: "master.categoryId" });
  const masterDescription = useWatch({ control, name: "master.description" });
  const masterBrand = useWatch({ control, name: "master.brand" });
  const masterFeatures = useWatch({ control, name: "master.features" });
  const variants = useWatch({ control, name: "variants" });
  const [selectedTab, setSelectedTab] = useState<string>("master");
  const [isGuideModalOpen, setIsGuideModalOpen] = useState(false);

  // Preserve selectedTab when variants array changes (but not when updating fields)
  useEffect(() => {
    // Only reset tab if we're on a variant tab that no longer exists
    if (selectedTab.startsWith("variant-")) {
      const variantIndex = parseInt(selectedTab.replace("variant-", ""), 10);

      if (isNaN(variantIndex) || variantIndex >= (variants?.length ?? 0)) {
        // Variant tab no longer exists, switch to master
        setSelectedTab("master");
      }
    }
  }, [variants?.length, selectedTab]);

  const isBusy = loading || isSubmitting;

  // Calculate disabled features based on product type
  const disabledFeatures = useMemo(() => {
    if (!masterType) return new Set<string>();
    const forbidden = FORBIDDEN_FEATURES_BY_TYPE[masterType] || [];

    return new Set(forbidden.map((f) => f));
  }, [masterType]);

  const addVariant = useCallback(() => {
    if (variantFields.length >= 20) return;
    const newIndex = variantFields.length;

    appendVariant(createDefaultVariant());
    // IBaseSwitch to the new variant tab
    setSelectedTab(`variant-${newIndex}`);
  }, [variantFields.length, appendVariant]);

  const removeVariantAtIndex = useCallback(
    (index: number) => {
      if (variantFields.length <= 1) return; // At least one variant required
      removeVariant(index);
      // If we're on the removed tab, switch to master or another variant
      if (selectedTab === `variant-${index}`) {
        if (index === 0 && variantFields.length > 1) {
          setSelectedTab("variant-0");
        } else if (index > 0) {
          setSelectedTab(`variant-${index - 1}`);
        } else {
          setSelectedTab("master");
        }
      }
    },
    [variantFields.length, removeVariant, selectedTab],
  );

  // Helper function to find first error field path
  const findFirstErrorField = useCallback(
    (errors: any, path = ""): string | null => {
      if (!errors) return null;

      for (const key in errors) {
        const currentPath = path ? `${path}.${key}` : key;
        const error = errors[key];

        if (error?.message) {
          return currentPath;
        }

        if (typeof error === "object" && error !== null) {
          const nestedError = findFirstErrorField(error, currentPath);

          if (nestedError) return nestedError;
        }
      }

      return null;
    },
    [],
  );

  const updateVariant = useCallback(
    (
      variantIndex: number,
      updater: (current: VariantFieldValue) => VariantFieldValue,
    ) => {
      const currentVariant = getValues(`variants.${variantIndex}`);

      if (!currentVariant) return;

      const updatedVariant = updater(currentVariant);

      // Check if this field has errors (only validate if already submitted and has errors)
      const hasError = Boolean(errors.variants?.[variantIndex]);
      const shouldValidate = isSubmitted && hasError;

      // Use setValue directly to update the variant field
      setValue(`variants.${variantIndex}` as any, updatedVariant, {
        shouldDirty: true,
        shouldValidate: shouldValidate, // Only validate if field has error after submit
        shouldTouch: true,
      });

      // Only trigger validation if field has error (after submit)
      if (shouldValidate) {
        trigger(`variants.${variantIndex}` as any).catch(() => {
          // Silently handle any validation errors
        });
      }
    },
    [getValues, setValue, trigger, errors, isSubmitted],
  );

  const handleValidSubmit: SubmitHandler<ProductFormFieldValues> = async (
    formValues,
  ) => {
    try {
      // Upload images before mapping to payload
      const uploadedFormValues = { ...formValues };

      // Upload master images
      if (formValues.master.images.length > 0) {
        uploadedFormValues.master.images = await MediaService.uploadImageItems(
          formValues.master.images,
        );
      }

      // Upload variant images
      uploadedFormValues.variants = await Promise.all(
        formValues.variants.map(async (variant) => {
          if (variant.images.length > 0) {
            const uploadedImages = await MediaService.uploadImageItems(
              variant.images,
            );

            return { ...variant, images: uploadedImages };
          }

          return variant;
        }),
      );

      // Check for upload errors
      const hasUploadErrors =
        uploadedFormValues.master.images.some(
          (img) => img.status === "error",
        ) ||
        uploadedFormValues.variants.some((variant) =>
          variant.images.some((img) => img.status === "error"),
        );

      if (hasUploadErrors) {
        throw new Error("Some images failed to upload. Please try again.");
      }

      // Map to payload after upload
      const payload = mapToProductFormValues(uploadedFormValues);

      await onSubmit(payload);
    } catch (error) {
      console.error("Error uploading images:", error);
      throw error;
    }
  };

  // Handle submit error - focus on first error field
  const handleSubmitError = useCallback(
    (submitErrors: any) => {
      const firstErrorPath = findFirstErrorField(submitErrors);

      if (firstErrorPath) {
        // IBaseSwitch to appropriate tab if error is in variant
        if (firstErrorPath.startsWith("variants.")) {
          const variantMatch = firstErrorPath.match(/variants\.(\d+)/);

          if (variantMatch) {
            const variantIndex = parseInt(variantMatch[1], 10);

            setSelectedTab(`variant-${variantIndex}`);
            // Wait for tab switch then focus
            setTimeout(() => {
              try {
                setFocus(firstErrorPath as keyof ProductFormFieldValues);
              } catch (e) {
                // Ignore focus errors for nested paths
              }
            }, 150);

            return;
          }
        } else if (firstErrorPath.startsWith("master.")) {
          // IBaseSwitch to master tab if error is in master
          setSelectedTab("master");
        }
        // Focus on the first error field
        setTimeout(() => {
          try {
            setFocus(firstErrorPath as keyof ProductFormFieldValues);
          } catch (e) {
            // Ignore focus errors for nested paths
          }
        }, 100);
      }
    },
    [findFirstErrorField, setFocus],
  );

  const handleValidSubmitAndContinue: SubmitHandler<
    ProductFormFieldValues
  > = async (formValues) => {
    if (!onSubmitAndContinue) {
      return;
    }

    try {
      // Upload images before mapping to payload
      const uploadedFormValues = { ...formValues };

      // Upload master images
      if (formValues.master.images.length > 0) {
        uploadedFormValues.master.images = await MediaService.uploadImageItems(
          formValues.master.images,
        );
      }

      // Upload variant images
      uploadedFormValues.variants = await Promise.all(
        formValues.variants.map(async (variant) => {
          if (variant.images.length > 0) {
            const uploadedImages = await MediaService.uploadImageItems(
              variant.images,
            );

            return { ...variant, images: uploadedImages };
          }

          return variant;
        }),
      );

      // Check for upload errors
      const hasUploadErrors =
        uploadedFormValues.master.images.some(
          (img) => img.status === "error",
        ) ||
        uploadedFormValues.variants.some((variant) =>
          variant.images.some((img) => img.status === "error"),
        );

      if (hasUploadErrors) {
        throw new Error("Some images failed to upload. Please try again.");
      }

      // Map to payload after upload
      const payload = mapToProductFormValues(uploadedFormValues);

      await onSubmitAndContinue(payload);
      reset(createDefaultValues(featureOptions));
    } catch (error) {
      console.error("Error uploading images:", error);
      throw error;
    }
  };

  const submitForm = handleSubmit(handleValidSubmit, handleSubmitError);

  const submitAndContinueForm = onSubmitAndContinue
    ? handleSubmit(handleValidSubmitAndContinue, handleSubmitError)
    : undefined;

  return (
    <form className="flex flex-col gap-4" onSubmit={submitForm}>
      <IBaseCard>
        <IBaseCardBody className="space-y-4">
          <div className="flex gap-2 justify-between">
            <div className="justify-start">
              <IBaseButton
                color="primary"
                isDisabled={isBusy || variantFields.length >= 20}
                size="sm"
                startContent={<Plus size={14} />}
                variant="light"
                onPress={addVariant}
              >
                {t("actions.add")} {t("variant")}
              </IBaseButton>
            </div>
            <div className="justify-end flex items-center gap-2">
              <IBaseTooltip content={tProduct("guideTooltip")} placement="top">
                <IBaseButton
                  isIconOnly
                  aria-label={tProduct("guideAriaLabel")}
                  isDisabled={isBusy}
                  size="sm"
                  variant="light"
                  onPress={() => setIsGuideModalOpen(true)}
                >
                  <HelpCircle className="text-default-500" size={18} />
                </IBaseButton>
              </IBaseTooltip>
              {onCancel ? (
                <IBaseButton
                  isDisabled={isBusy}
                  size="sm"
                  variant="light"
                  onPress={onCancel}
                >
                  {t("actions.cancel")}
                </IBaseButton>
              ) : null}

              {onSubmitAndContinue && submitAndContinueForm ? (
                <IBaseButton
                  isDisabled={isBusy}
                  size="sm"
                  type="button"
                  variant="bordered"
                  onPress={async () => {
                    await submitAndContinueForm();
                  }}
                >
                  {secondarySubmitLabel ??
                    `${t("actions.save")} & ${t("actions.add")} ${t("another")}`}
                </IBaseButton>
              ) : null}

              <IBaseButton
                color="primary"
                isDisabled={isBusy}
                isLoading={isBusy}
                size="sm"
                type="submit"
                onPress={() => {
                  submitForm();
                }}
              >
                {submitLabel ?? t("actions.save")}
              </IBaseButton>
            </div>
          </div>

          <FormProvider {...form}>
            <IBaseTabs
              aria-label="Product form tabs"
              classNames={{
                tabList: "overflow-x-auto mb-0",
                tab: "max-w-[80px]",
                tabContent: "max-w-[80px] truncate",
                base: "mb-0",
              }}
              color="primary"
              selectedKey={selectedTab}
              onSelectionChange={(key: React.Key) =>
                setSelectedTab(key as string)
              }
            >
              <IBaseTab key="master" title={t("master")}>
                <MasterTab
                  categoryOptions={categoryOptions}
                  categoryQueryLoading={categoryQuery.isLoading}
                  disabledFeatures={disabledFeatures}
                  errors={errors.master}
                  featureOptions={featureOptions}
                  isBusy={isBusy}
                  value={{
                    name: masterName ?? { en: "", vi: "" },
                    code: masterCode ?? "",
                    categoryId: masterCategoryId,
                    brand: masterBrand ?? "",
                    type: masterType as ProductMasterType,
                    description: masterDescription ?? "",
                    features: masterFeatures ?? {},
                    isActive: true,
                    images: [],
                  }}
                  onUpdate={(updater) => {
                    const current = {
                      name: masterName ?? { en: "", vi: "" },
                      code: masterCode ?? "",
                      categoryId: masterCategoryId,
                      brand: masterBrand ?? "",
                      type: masterType ?? ProductMasterType.GOODS,
                      description: masterDescription ?? "",
                      features: masterFeatures ?? {},
                      isActive: true,
                      images: [],
                    };
                    const updated = updater(current);

                    // If product type changed, reset features using getFeaturesByProductType
                    if (
                      updated.type !== current.type &&
                      featureOptions.length > 0
                    ) {
                      updated.features = getFeaturesByProductType(
                        updated.type,
                        featureOptions,
                        current.features,
                      );
                    }

                    // Check if master has errors (only validate if already submitted and has errors)
                    const hasMasterError = Boolean(errors.master);
                    const shouldValidateMaster = isSubmitted && hasMasterError;

                    setValue("master", updated, {
                      shouldDirty: true,
                      shouldValidate: shouldValidateMaster, // Only validate if field has error after submit
                    });
                    // Only trigger validation if master has error (after submit)
                    if (shouldValidateMaster) {
                      trigger("master").catch(() => {
                        // Silently handle any validation errors
                      });
                    }
                  }}
                />
              </IBaseTab>

              {useMemo(
                () =>
                  variantFields.map((field, variantIndex) => {
                    const variant = variants?.[variantIndex];
                    const variantErrors = errors.variants?.[variantIndex];
                    const tabTitle =
                      variant?.sku?.trim() ||
                      `${t("variant")} ${variantIndex + 1}`;
                    const truncatedTitle =
                      tabTitle.length > 12
                        ? `${tabTitle.substring(0, 12)}...`
                        : tabTitle;
                    // Use stable key based on index to prevent tab switching
                    const tabKey = `variant-${variantIndex}`;

                    return (
                      <IBaseTab key={tabKey} title={truncatedTitle}>
                        <VariantTab
                          canRemove={variantFields.length > 1}
                          isBusy={isBusy}
                          masterFeatures={masterFeatures}
                          value={variant ?? createDefaultVariant()}
                          variantErrors={variantErrors as any}
                          variantIndex={variantIndex}
                          onRemove={() => removeVariantAtIndex(variantIndex)}
                          onUpdate={(updater) =>
                            updateVariant(variantIndex, updater)
                          }
                        />
                      </IBaseTab>
                    );
                  }),
                [
                  variantFields,
                  variants,
                  errors.variants,
                  masterFeatures,
                  isBusy,
                  t,
                  removeVariantAtIndex,
                  updateVariant,
                ],
              )}
            </IBaseTabs>
          </FormProvider>
        </IBaseCardBody>
      </IBaseCard>

      <ProductFormGuideModal
        isOpen={isGuideModalOpen}
        onClose={() => setIsGuideModalOpen(false)}
      />
    </form>
  );
}
