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
  IBasePageLayout,
} from "@base/client/components";
import { useSetBreadcrumbs } from "@base/client/hooks";
import sequenceService from "@base/client/services/SequenceService";


const SEQUENCES_LIST_QUERY_KEY = ["settings", "sequences", "list"] as const;
const BASE_PATH = "/workspace/settings/sequences";

export default function SequenceCreatePage() {
  const t = useTranslations("settings.sequences");
  const actionsT = useTranslations("common.actions");
  const errorsT = useTranslations("common.errors");
  const queryClient = useQueryClient();
  const router = useRouter();

  const [name, setName] = useState("");
  const [prefix, setPrefix] = useState("");
  const [format, setFormat] = useState("%06d");
  const [start, setStart] = useState("1");
  const [step, setStep] = useState("1");
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
      name: string;
      prefix?: string;
      format?: string;
      start?: number;
      step?: number;
    }) => sequenceService.createRule(payload),
    onSuccess: () => {
      addToast({ title: t("toast.createSuccess"), color: "success", variant: "solid" });
      queryClient.invalidateQueries({ queryKey: SEQUENCES_LIST_QUERY_KEY });
      router.push(BASE_PATH);
    },
    onError: (error) => {
      addToast({
        title: error instanceof Error ? error.message : t("toast.createError"),
        color: "danger",
        variant: "solid",
      });
    },
  });

  const validate = useCallback(() => {
    const newErrors: Record<string, string> = {};

    if (!name.trim()) newErrors.name = errorsT("required");
    const startNum = parseInt(start, 10);

    if (isNaN(startNum) || startNum < 0) newErrors.start = errorsT("invalid");
    const stepNum = parseInt(step, 10);

    if (isNaN(stepNum) || stepNum < 1) newErrors.step = errorsT("invalid");
    setErrors(newErrors);

    return Object.keys(newErrors).length === 0;
  }, [name, start, step, errorsT]);

  const handleSubmit = useCallback(() => {
    if (!validate()) return;
    createMutation.mutate({
      name: name.trim(),
      prefix: prefix.trim() || undefined,
      format: format.trim() || "%06d",
      start: parseInt(start, 10),
      step: parseInt(step, 10),
    });
  }, [name, prefix, format, start, step, validate, createMutation]);

  return (
    <IBasePageLayout
      maxWidth="form"
      title={t("create.title")}
      variant="create"
    >
      <IBaseCard>
        <IBaseCardBody className="flex flex-col gap-4">
          <IBaseInput
            isRequired
            description={t("form.nameDescription")}
            errorMessage={errors.name}
            isInvalid={!!errors.name}
            label={t("form.name")}
            value={name}
            onValueChange={setName}
          />
          <IBaseInput
            description={t("form.prefixDescription")}
            label={t("form.prefix")}
            value={prefix}
            onValueChange={setPrefix}
          />
          <IBaseInput
            description={t("form.formatDescription")}
            label={t("form.format")}
            value={format}
            onValueChange={setFormat}
          />
          <div className="grid grid-cols-2 gap-4">
            <IBaseInput
              description={t("form.start")}
              errorMessage={errors.start}
              isInvalid={!!errors.start}
              label={t("form.start")}
              type="number"
              value={start}
              onValueChange={setStart}
            />
            <IBaseInput
              description={t("form.step")}
              errorMessage={errors.step}
              isInvalid={!!errors.step}
              label={t("form.step")}
              type="number"
              value={step}
              onValueChange={setStep}
            />
          </div>
          <div className="flex flex-wrap items-center gap-3 border-t border-default-200 pt-6">
            <IBaseButton
              color="primary"
              isLoading={createMutation.isPending}
              size="md"
              onPress={handleSubmit}
            >
              {actionsT("save")}
            </IBaseButton>
            <IBaseButton size="md" variant="light" onPress={() => router.push(BASE_PATH)}>
              {actionsT("cancel")}
            </IBaseButton>
          </div>
        </IBaseCardBody>
      </IBaseCard>
    </IBasePageLayout>
  );
}
