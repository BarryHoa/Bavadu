"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useTranslations } from "next-intl";
import { useParams, useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";
import { addToast } from "@heroui/toast";

import {
  IBaseButton,
  IBaseCard,
  IBaseCardBody,
  IBaseChip,
  IBaseInput,
  IBaseInputNumber,
  IBaseModal,
  IBaseModalBody,
  IBaseModalContent,
  IBaseModalFooter,
  IBaseModalHeader,
  IBasePageLayout,
  IBaseTextarea,
} from "@base/client/components";
import { useSetBreadcrumbs } from "@base/client/hooks";
import sequenceService from "@base/client/services/SequenceService";
import { SequenceFormSidebar } from "./components/SequenceFormSidebar";

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

  const [code, setCode] = useState("");
  const [name, setName] = useState("");
  const [prefix, setPrefix] = useState("");
  const [suffix, setSuffix] = useState("");
  const [description, setDescription] = useState("");
  const [format, setFormat] = useState("%06d");
  const [start, setStart] = useState<number | null>(1);
  const [step, setStep] = useState<number | null>(1);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showToggleConfirm, setShowToggleConfirm] = useState(false);

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
      { label: rule ? rule.code : t("loading") },
    ],
    [t, rule],
  );

  useSetBreadcrumbs(breadcrumbs);

  useEffect(() => {
    if (rule) {
      setCode(rule.code);
      setName(rule.name ?? "");
      setPrefix(rule.prefix ?? "");
      setSuffix(rule.suffix ?? "");
      setDescription(rule.description ?? "");
      setFormat(rule.format ?? "%06d");
      setStart(rule.start ?? 1);
      setStep(rule.step ?? 1);
    }
  }, [rule]);

  const updateMutation = useMutation({
    mutationFn: (payload: {
      id: string;
      code?: string;
      name?: string;
      prefix?: string;
      suffix?: string;
      description?: string;
      format?: string;
      start?: number;
      step?: number;
      isActive?: boolean;
    }) => sequenceService.updateRule(payload),
    onSuccess: () => {
      addToast({
        title: t("toast.updateSuccess"),
        color: "success",
        variant: "solid",
      });
      queryClient.invalidateQueries({ queryKey: SEQUENCES_LIST_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: SEQUENCE_QUERY_KEY(id) });
      router.push(BASE_PATH);
    },
    onError: (error) => {
      addToast({
        title:
          error instanceof Error ? error.message : t("toast.updateError"),
        color: "danger",
        variant: "solid",
      });
    },
  });

  const toggleMutation = useMutation({
    mutationFn: (payload: { id: string; isActive: boolean }) =>
      sequenceService.updateRule(payload),
    onSuccess: () => {
      addToast({
        title: t("toast.updateSuccess"),
        color: "success",
        variant: "solid",
      });
      queryClient.invalidateQueries({ queryKey: SEQUENCES_LIST_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: SEQUENCE_QUERY_KEY(id) });
      setShowToggleConfirm(false);
    },
    onError: (error) => {
      addToast({
        title:
          error instanceof Error ? error.message : t("toast.updateError"),
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
    if (!validate() || hasCount) return;
    updateMutation.mutate({
      id,
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
    id,
    code,
    name,
    prefix,
    suffix,
    description,
    format,
    start,
    step,
    hasCount,
    validate,
    updateMutation,
  ]);

  const handleToggleActive = useCallback(() => {
    setShowToggleConfirm(true);
  }, []);

  const handleConfirmToggleActive = useCallback(() => {
    toggleMutation.mutate({ id, isActive: !(rule?.isActive ?? false) });
  }, [id, rule?.isActive, toggleMutation]);

  const handleSaveSafeFields = useCallback(() => {
    if (!validate()) return;
    updateMutation.mutate({
      id,
      name: name.trim() || undefined,
      description: description.trim() || undefined,
    });
  }, [id, name, description, validate, updateMutation]);

  if (ruleQuery.isLoading || !rule) {
    return (
      <IBasePageLayout maxWidth="form" title={t("loading")} variant="edit">
        <IBaseCard>
          <IBaseCardBody>Loading...</IBaseCardBody>
        </IBaseCard>
      </IBasePageLayout>
    );
  }

  return (
    <IBasePageLayout
      maxWidth="form"
      title={t("edit.title")}
      variant="edit"
      sidebar={<SequenceFormSidebar />}
    >
      <IBaseCard>
        <IBaseCardBody className="flex flex-col gap-4">
          {hasCount && (
            <>
              <div className="rounded-lg border border-warning-200 bg-warning-50 p-3 text-sm text-warning-800 dark:border-warning-800 dark:bg-warning-950 dark:text-warning-200">
                {t("form.cannotEditHasCount")}
              </div>
              <div className="rounded-lg border border-default-200 bg-default-50/50 p-4">
                <h3 className="mb-3 text-sm font-medium text-foreground">
                  {t("form.lockedFieldsSection")}
                </h3>
                <dl className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm md:grid-cols-3">
                  <div>
                    <dt className="text-default-500">{t("form.code")}</dt>
                    <dd className="font-medium">{code || "—"}</dd>
                  </div>
                  <div>
                    <dt className="text-default-500">{t("form.prefix")}</dt>
                    <dd className="font-medium">{prefix || "—"}</dd>
                  </div>
                  <div>
                    <dt className="text-default-500">{t("form.suffix")}</dt>
                    <dd className="font-medium">{suffix || "—"}</dd>
                  </div>
                  <div>
                    <dt className="text-default-500">{t("form.format")}</dt>
                    <dd className="font-medium">{format || "—"}</dd>
                  </div>
                  <div>
                    <dt className="text-default-500">{t("form.start")}</dt>
                    <dd className="font-medium">{start ?? "—"}</dd>
                  </div>
                  <div>
                    <dt className="text-default-500">{t("form.step")}</dt>
                    <dd className="font-medium">{step ?? "—"}</dd>
                  </div>
                </dl>
              </div>
            </>
          )}

          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">{t("form.status")}</span>
            <IBaseChip
              size="sm"
              variant="flat"
              color={rule.isActive ? "success" : "default"}
            >
              {rule.isActive ? t("form.active") : t("form.inactive")}
            </IBaseChip>
          </div>

          {!hasCount && (
            <>
              <IBaseInput
                isRequired
                description={t("form.codeDescription")}
                errorMessage={errors.code}
                isInvalid={!!errors.code}
                label={t("form.code")}
                value={code}
                onValueChange={setCode}
              />
              <div className="grid grid-cols-2 gap-4">
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
            </>
          )}

          <IBaseInput
            description={t("form.nameDescription")}
            label={t("form.name")}
            value={name}
            onValueChange={setName}
          />
          <IBaseTextarea
            label={t("form.description")}
            placeholder={t("form.descriptionPlaceholder")}
            value={description}
            onValueChange={setDescription}
          />

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
            {hasCount && (
              <IBaseButton
                isLoading={updateMutation.isPending}
                size="md"
                onPress={handleSaveSafeFields}
              >
                {actionsT("save")}
              </IBaseButton>
            )}
            <IBaseButton
              isLoading={toggleMutation.isPending}
              size="md"
              variant="flat"
              color={rule.isActive ? "danger" : "success"}
              onPress={handleToggleActive}
            >
              {rule.isActive ? t("form.inactive") : t("form.active")}
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

      <IBaseModal isOpen={showToggleConfirm} onClose={() => setShowToggleConfirm(false)}>
        <IBaseModalContent>
          {(onClose) => (
            <>
              <IBaseModalHeader>{t("toggleStatusConfirm.title")}</IBaseModalHeader>
              <IBaseModalBody>
                <p>{t("toggleStatusConfirm.message")}</p>
              </IBaseModalBody>
              <IBaseModalFooter>
                <IBaseButton
                  variant="light"
                  onPress={onClose}
                  isDisabled={toggleMutation.isPending}
                >
                  {actionsT("cancel")}
                </IBaseButton>
                <IBaseButton
                  color={rule?.isActive ? "danger" : "success"}
                  isLoading={toggleMutation.isPending}
                  onPress={handleConfirmToggleActive}
                >
                  {actionsT("confirm")}
                </IBaseButton>
              </IBaseModalFooter>
            </>
          )}
        </IBaseModalContent>
      </IBaseModal>
    </IBasePageLayout>
  );
}
