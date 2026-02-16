"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useTranslations } from "next-intl";
import { useParams, useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";

import {
  IBaseButton,
  IBaseCard,
  IBaseCardBody,
  IBaseChip,
  IBaseInput,
  IBasePageLayout,
} from "@base/client/components";
import { useSetBreadcrumbs } from "@base/client/hooks";
import sequenceService from "@base/client/services/SequenceService";

import { addToast } from "@heroui/toast";

const SEQUENCES_LIST_QUERY_KEY = ["settings", "sequences", "list"] as const;
const SEQUENCE_QUERY_KEY = (id: string) =>
  ["settings", "sequences", "get", id] as const;
const BASE_PATH = "/workspace/settings/sequences";

export default function SequenceEditPage() {
  const t = useTranslations("settings.sequences");
  const actionsT = useTranslations("common.actions");
  const errorsT = useTranslations("common.errors");
  const queryClient = useQueryClient();
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;

  const [name, setName] = useState("");
  const [prefix, setPrefix] = useState("");
  const [format, setFormat] = useState("%06d");
  const [start, setStart] = useState("1");
  const [step, setStep] = useState("1");
  const [errors, setErrors] = useState<Record<string, string>>({});

  const ruleQuery = useQuery({
    queryKey: SEQUENCE_QUERY_KEY(id),
    queryFn: () => sequenceService.getRule(id),
    enabled: !!id,
  });

  const rule = ruleQuery.data;
  const hasCount = (rule?.countCount ?? 0) > 0;

  const breadcrumbs = useMemo(
    () => [
      { label: t("listTitle"), href: BASE_PATH },
      { label: rule ? t("edit.title") : t("loading") },
    ],
    [t, rule],
  );
  useSetBreadcrumbs(breadcrumbs);

  useEffect(() => {
    if (rule) {
      setName(rule.name);
      setPrefix(rule.prefix ?? "");
      setFormat(rule.format ?? "%06d");
      setStart(String(rule.start ?? 1));
      setStep(String(rule.step ?? 1));
    }
  }, [rule]);

  const updateMutation = useMutation({
    mutationFn: (payload: {
      id: string;
      name?: string;
      prefix?: string;
      format?: string;
      start?: number;
      step?: number;
      isActive?: boolean;
    }) => sequenceService.updateRule(payload),
    onSuccess: () => {
      addToast({ title: t("toast.updateSuccess"), color: "success", variant: "solid" });
      queryClient.invalidateQueries({ queryKey: SEQUENCES_LIST_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: SEQUENCE_QUERY_KEY(id) });
      router.push(BASE_PATH);
    },
    onError: (error) => {
      addToast({
        title: error instanceof Error ? error.message : t("toast.updateError"),
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
    if (!validate() || hasCount) return;
    updateMutation.mutate({
      id,
      name: name.trim(),
      prefix: prefix.trim() || undefined,
      format: format.trim() || "%06d",
      start: parseInt(start, 10),
      step: parseInt(step, 10),
    });
  }, [id, name, prefix, format, start, step, hasCount, validate, updateMutation]);

  const handleToggleActive = useCallback(() => {
    updateMutation.mutate({
      id,
      isActive: !rule?.isActive,
    });
  }, [id, rule?.isActive, updateMutation]);

  if (ruleQuery.isLoading || !rule) {
    return (
      <IBasePageLayout variant="edit" maxWidth="form" title={t("loading")}>
        <IBaseCard>
          <IBaseCardBody>Loading...</IBaseCardBody>
        </IBaseCard>
      </IBasePageLayout>
    );
  }

  return (
    <IBasePageLayout
      variant="edit"
      maxWidth="form"
      title={t("edit.title")}
    >
      <IBaseCard>
        <IBaseCardBody className="flex flex-col gap-4">
          {hasCount && (
            <div className="rounded-lg border border-warning-200 bg-warning-50 p-3 text-sm text-warning-800 dark:border-warning-800 dark:bg-warning-950 dark:text-warning-200">
              {t("form.cannotEditHasCount")}
            </div>
          )}

          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">{t("form.status")}</span>
            <IBaseChip size="sm" variant="flat">
              {rule.isActive ? t("form.active") : t("form.inactive")}
            </IBaseChip>
          </div>

          <IBaseInput
            isRequired
            description={t("form.nameDescription")}
            errorMessage={errors.name}
            isInvalid={!!errors.name}
            isReadOnly={hasCount}
            label={t("form.name")}
            value={name}
            onValueChange={setName}
          />
          <IBaseInput
            description={t("form.prefixDescription")}
            isReadOnly={hasCount}
            label={t("form.prefix")}
            value={prefix}
            onValueChange={setPrefix}
          />
          <IBaseInput
            description={t("form.formatDescription")}
            isReadOnly={hasCount}
            label={t("form.format")}
            value={format}
            onValueChange={setFormat}
          />
          <div className="grid grid-cols-2 gap-4">
            <IBaseInput
              errorMessage={errors.start}
              isInvalid={!!errors.start}
              isReadOnly={hasCount}
              label={t("form.start")}
              type="number"
              value={start}
              onValueChange={setStart}
            />
            <IBaseInput
              errorMessage={errors.step}
              isInvalid={!!errors.step}
              isReadOnly={hasCount}
              label={t("form.step")}
              type="number"
              value={step}
              onValueChange={setStep}
            />
          </div>

          {rule.counts && rule.counts.length > 0 && (
            <div>
              <span className="mb-2 block text-sm font-medium">
                {t("table.columns.countCount")} (last 3)
              </span>
              <ul className="list-inside list-disc space-y-1 text-sm">
                {rule.counts.map((c, i) => (
                  <li key={i}>{c.value}</li>
                ))}
              </ul>
            </div>
          )}

          <div className="flex flex-wrap items-center gap-3 border-t border-default-200 pt-6">
            {!hasCount && (
              <IBaseButton
                color="primary"
                isLoading={updateMutation.isPending}
                size="md"
                onPress={handleSubmit}
              >
                {actionsT("save")}
              </IBaseButton>
            )}
            <IBaseButton
              size="md"
              variant="flat"
              onPress={handleToggleActive}
              isLoading={updateMutation.isPending}
            >
              {rule.isActive ? t("table.columns.setInactive") : t("table.columns.setActive")}
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
