"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";

import {
  IBaseButton,
  IBaseCard,
  IBaseCardBody,
  IBaseInput,
  IBasePageLayout,
  IBaseSelect,
  IBaseSelectItem,
  IBaseSwitch,
} from "@base/client/components";
import { useSetBreadcrumbs } from "@base/client/hooks";
import {
  timesheetSettingsService,
  type TimesheetSettingsUpdatePayload,
} from "@mdl/hrm/client/services/TimesheetSettingsService";

import { addToast } from "@heroui/toast";

const SETTINGS_QUERY_KEY = ["hrm", "timesheet-settings"] as const;
const WEEK_START_OPTIONS = [
  { value: 0, labelKey: "sun" },
  { value: 1, labelKey: "mon" },
  { value: 2, labelKey: "tue" },
  { value: 3, labelKey: "wed" },
  { value: 4, labelKey: "thu" },
  { value: 5, labelKey: "fri" },
  { value: 6, labelKey: "sat" },
];
const ROUND_DIRECTION_OPTIONS = [
  { value: "down", labelKey: "roundDown" },
  { value: "up", labelKey: "roundUp" },
  { value: "nearest", labelKey: "roundNearest" },
];

function timeToInputValue(v: string | null | undefined): string {
  if (!v) return "";
  const s = String(v);
  if (/^\d{1,2}:\d{2}(:\d{2})?$/.test(s)) return s.slice(0, 5);
  return "";
}

export default function TimesheetSettingsPage(): React.ReactNode {
  const t = useTranslations("hrm.settings.timesheets");
  const tCommon = useTranslations("common");
  const queryClient = useQueryClient();

  const [defaultCheckInTime, setDefaultCheckInTime] = useState("");
  const [defaultCheckOutTime, setDefaultCheckOutTime] = useState("");
  const [breakMinutes, setBreakMinutes] = useState("60");
  const [maxHoursPerDay, setMaxHoursPerDay] = useState("");
  const [allowWeekend, setAllowWeekend] = useState(false);
  const [weekStart, setWeekStart] = useState(1);
  const [roundMinutes, setRoundMinutes] = useState("15");
  const [roundDirection, setRoundDirection] = useState("nearest");

  const { data: settings, isLoading } = useQuery({
    queryKey: SETTINGS_QUERY_KEY,
    queryFn: () => timesheetSettingsService.getSettings(),
  });

  useEffect(() => {
    if (settings) {
      setDefaultCheckInTime(timeToInputValue(settings.defaultCheckInTime));
      setDefaultCheckOutTime(timeToInputValue(settings.defaultCheckOutTime));
      setBreakMinutes(String(settings.breakMinutes ?? 60));
      setMaxHoursPerDay(
        settings.maxHoursPerDay != null ? String(settings.maxHoursPerDay) : "",
      );
      setAllowWeekend(!!settings.allowWeekend);
      setWeekStart(settings.weekStart ?? 1);
      setRoundMinutes(String(settings.roundMinutes ?? 15));
      setRoundDirection(settings.roundDirection ?? "nearest");
    }
  }, [settings]);

  const updateMutation = useMutation({
    mutationFn: (payload: TimesheetSettingsUpdatePayload) =>
      timesheetSettingsService.updateSettings(payload),
    onSuccess: () => {
      addToast({
        title: t("toastSaved"),
        color: "success",
        variant: "solid",
      });
      queryClient.invalidateQueries({ queryKey: SETTINGS_QUERY_KEY });
    },
    onError: (error) => {
      addToast({
        title: error instanceof Error ? error.message : t("toastError"),
        color: "danger",
        variant: "solid",
      });
    },
  });

  const handleSubmit = () => {
    const payload: TimesheetSettingsUpdatePayload = {
      defaultCheckInTime: defaultCheckInTime || undefined,
      defaultCheckOutTime: defaultCheckOutTime || undefined,
      breakMinutes: parseInt(breakMinutes, 10) || 60,
      maxHoursPerDay: maxHoursPerDay ? parseInt(maxHoursPerDay, 10) : undefined,
      allowWeekend: allowWeekend,
      weekStart: weekStart,
      roundMinutes: parseInt(roundMinutes, 10) || 15,
      roundDirection: roundDirection,
    };
    updateMutation.mutate(payload);
  };

  const breadcrumbs = [{ label: t("title") }];
  useSetBreadcrumbs(breadcrumbs);

  return (
    <IBasePageLayout title={t("title")}>
      <IBaseCard className="max-w-2xl">
        <IBaseCardBody>
          {isLoading ? (
            <p className="text-muted-foreground">{tCommon("loading")}</p>
          ) : (
            <div className="space-y-6">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <IBaseInput
                  type="time"
                  label={t("defaultCheckInTime")}
                  value={defaultCheckInTime}
                  onValueChange={setDefaultCheckInTime}
                  description={t("defaultCheckInTimeDesc")}
                />
                <IBaseInput
                  type="time"
                  label={t("defaultCheckOutTime")}
                  value={defaultCheckOutTime}
                  onValueChange={setDefaultCheckOutTime}
                  description={t("defaultCheckOutTimeDesc")}
                />
              </div>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <IBaseInput
                  type="number"
                  label={t("breakMinutes")}
                  value={breakMinutes}
                  onValueChange={setBreakMinutes}
                  min={0}
                  description={t("breakMinutesDesc")}
                />
                <IBaseInput
                  type="number"
                  label={t("maxHoursPerDay")}
                  value={maxHoursPerDay}
                  onValueChange={setMaxHoursPerDay}
                  min={1}
                  description={t("maxHoursPerDayDesc")}
                />
              </div>
              <IBaseSwitch
                isSelected={allowWeekend}
                onValueChange={setAllowWeekend}
              >
                {t("allowWeekend")}
              </IBaseSwitch>
              <IBaseSelect
                label={t("weekStart")}
                selectedKeys={[String(weekStart)]}
                onSelectionChange={(keys) => {
                  const v = Array.from(keys)[0];
                  if (v != null) setWeekStart(Number(v));
                }}
                description={t("weekStartDesc")}
              >
                {WEEK_START_OPTIONS.map((opt) => (
                  <IBaseSelectItem key={String(opt.value)}>
                    {t(opt.labelKey)}
                  </IBaseSelectItem>
                ))}
              </IBaseSelect>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <IBaseInput
                  type="number"
                  label={t("roundMinutes")}
                  value={roundMinutes}
                  onValueChange={setRoundMinutes}
                  min={1}
                  description={t("roundMinutesDesc")}
                />
                <IBaseSelect
                  label={t("roundDirection")}
                  selectedKeys={[roundDirection]}
                  onSelectionChange={(keys) => {
                    const v = Array.from(keys)[0];
                    if (typeof v === "string") setRoundDirection(v);
                  }}
                  description={t("roundDirectionDesc")}
                >
                  {ROUND_DIRECTION_OPTIONS.map((opt) => (
                    <IBaseSelectItem key={opt.value}>
                      {t(opt.labelKey)}
                    </IBaseSelectItem>
                  ))}
                </IBaseSelect>
              </div>
              <div className="flex gap-2 pt-2">
                <IBaseButton
                  color="primary"
                  onPress={handleSubmit}
                  isLoading={updateMutation.isPending}
                >
                  {tCommon("actions.save")}
                </IBaseButton>
              </div>
            </div>
          )}
        </IBaseCardBody>
      </IBaseCard>
    </IBasePageLayout>
  );
}
