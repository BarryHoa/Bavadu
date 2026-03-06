"use client";

import { useQuery } from "@tanstack/react-query";
import { Lightbulb, Loader2 } from "lucide-react";
import { useTranslations } from "next-intl";

import {
  IBaseCard,
  IBaseCardBody,
  MarkdownContent,
} from "@base/client/components";
import guidelineService from "@base/client/services/GuidelineService";

const GUIDELINE_KEY = "sequence-form";

export function SequenceFormSidebar() {
  const t = useTranslations("base.pages.settings.sequences.sidebar");
  const tGuidelines = useTranslations("base.guidelines");

  const { data: content, isLoading, error } = useQuery({
    queryKey: ["guideline", GUIDELINE_KEY],
    queryFn: () => guidelineService.getByKey(GUIDELINE_KEY),
    staleTime: 5 * 60 * 1000,
  });

  return (
    <IBaseCard className="border border-default-200/60 shadow-sm">
      <IBaseCardBody className="gap-3 p-4">
        <div className="flex items-center gap-2">
          <Lightbulb className="text-warning-500 shrink-0" size={18} />
          <h3 className="text-sm font-semibold text-foreground">
            {t("guidelines")}
          </h3>
        </div>
        {isLoading ? (
          <div className="flex items-center justify-center py-6">
            <Loader2 className="h-5 w-5 animate-spin text-default-500" />
          </div>
        ) : error ? (
          <p className="text-sm text-default-500">{tGuidelines("error")}</p>
        ) : content ? (
          <div className="prose prose-sm max-w-none text-default-600">
            <MarkdownContent content={content} className="text-sm" />
          </div>
        ) : (
          <p className="text-sm text-default-500">{tGuidelines("notFound")}</p>
        )}
      </IBaseCardBody>
    </IBaseCard>
  );
}
