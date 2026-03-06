"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { useCallback, useMemo, useState } from "react";
import { addToast } from "@heroui/toast";

import {
  IBaseButton,
  IBaseCard,
  IBaseCardBody,
  IBaseInput,
  IBaseInputNumber,
  IBasePageLayout,
  IBaseTextarea,
} from "@base/client/components";
import { useSetBreadcrumbs } from "@base/client/hooks";
import sequenceService from "@base/client/services/SequenceService";
import { SequenceFormSidebar } from "./components/SequenceFormSidebar";

const SEQUENCES_LIST_QUERY_KEY = ["settings", "sequences", "list"] as const;
const BASE_PATH = "/workspace/settings/sequences";

export default function SequenceCreatePage() {
  const t = useTranslations("base.pages.settings.sequences");
  const actionsT = useTranslations("base.general.actions");
  const errorsT = useTranslations("base.general.errors");
  const queryClient = useQueryClient();
  const router = useRouter();

  const [code, setCode] = useState("");
  const [name, setName] = useState("");
  const [prefix, setPrefix] = useState("");
  const [suffix, setSuffix] = useState("");
  const [description, setDescription] = useState("");
  const [format, setFormat] = useState("%06d");
  const [start, setStart] = useState<number | null>(1);
  const [step, setStep] = useState<number | null>(1);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const breadcrumbs = useMemo(
    () => [
      { label: t("listTitle"), href: BASE_PATH },
      { label: t("create.title") },
    ],
    [t],
  );

  useSetBreadcrumbs(breadcrumbs);

  const createMutation = useMutation({
    mutationFn: (payload: {
      code: string;
      name?: string;
      prefix?: string;
      suffix?: string;
      description?: string;
      format?: string;
      start?: number;
      step?: number;
    }) => sequenceService.createRule(payload),
    onSuccess: () => {
      addToast({
        title: t("toast.createSuccess"),
        color: "success",
        variant: "solid",
      });
      queryClient.invalidateQueries({ queryKey: SEQUENCES_LIST_QUERY_KEY });
      router.push(BASE_PATH);
    },
    onError: (error) => {
      addToast({
        title:
          error instanceof Error ? error.message : t("toast.createError"),
        color: "danger",
        variant: "solid",
      });
    },
  });

  const validate = useCallback(() => {
    const newErrors: Record<string, string> = {};

    if (!code.trim()) newErrors.code = errorsT("required");
    const startNum = start ?? 0;

    if (startNum < 0) newErrors.start = errorsT("invalid");
    const stepNum = step ?? 0;

    if (stepNum < 1) newErrors.step = errorsT("invalid");
    setErrors(newErrors);

    return Object.keys(newErrors).length === 0;
  }, [code, start, step, errorsT]);

  const handleSubmit = useCallback(() => {
    if (!validate()) return;
    createMutation.mutate({
      code: code.trim(),
      name: name.trim() || undefined,
      prefix: prefix.trim() || undefined,
      suffix: suffix.trim() || undefined,
      description: description.trim() || undefined,
      format: format.trim() || "%06d",
      start: start ?? 1,
      step: step ?? 1,
    });
  }, [
    code,
    name,
    prefix,
    suffix,
    description,
    format,
    start,
    step,
    validate,
    createMutation,
  ]);

  return (
    <IBasePageLayout
      maxWidth="form"
      title={t("create.title")}
      variant="create"
      sidebar={<SequenceFormSidebar />}
    >
      <IBaseCard>
        <IBaseCardBody className="flex flex-col gap-4">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <IBaseInput
              isRequired
              description={t("form.codeDescription")}
              errorMessage={errors.code}
              isInvalid={!!errors.code}
              label={t("form.code")}
              value={code}
              onValueChange={setCode}
            />
            <IBaseInput
              description={t("form.nameDescription")}
              label={t("form.name")}
              value={name}
              onValueChange={setName}
            />
          </div>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <IBaseInput
              description={t("form.prefixDescription")}
              label={t("form.prefix")}
              value={prefix}
              onValueChange={setPrefix}
            />
            <IBaseInput
              description={t("form.suffixDescription")}
              label={t("form.suffix")}
              value={suffix}
              onValueChange={setSuffix}
            />
          </div>
          <IBaseInput
            description={t("form.formatDescription")}
            label={t("form.format")}
            value={format}
            onValueChange={setFormat}
          />
          <div className="grid grid-cols-2 gap-4">
            <IBaseInputNumber
              allowNegative={false}
              errorMessage={errors.start}
              isInvalid={!!errors.start}
              label={t("form.start")}
              min={0}
              value={start}
              onValueChange={(v) => setStart(v ?? null)}
            />
            <IBaseInputNumber
              allowNegative={false}
              errorMessage={errors.step}
              isInvalid={!!errors.step}
              label={t("form.step")}
              min={1}
              value={step}
              onValueChange={(v) => setStep(v ?? null)}
            />
          </div>
          <IBaseTextarea
            label={t("form.description")}
            placeholder={t("form.descriptionPlaceholder")}
            value={description}
            onValueChange={setDescription}
          />
          <div className="flex flex-wrap items-center gap-3 border-t border-default-200 pt-6">
            <IBaseButton
              color="primary"
              isLoading={createMutation.isPending}
              size="md"
              onPress={handleSubmit}
            >
              {actionsT("save")}
            </IBaseButton>
            <IBaseButton
              size="md"
              variant="light"
              onPress={() => router.push(BASE_PATH)}
            >
              {actionsT("cancel")}
            </IBaseButton>
          </div>
        </IBaseCardBody>
      </IBaseCard>
    </IBasePageLayout>
  );
}
