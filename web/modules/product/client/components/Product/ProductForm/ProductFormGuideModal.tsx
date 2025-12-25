"use client";

import { MarkdownContent } from "@base/client/components";
import guidelineService from "@base/client/services/GuidelineService";
import {
  IBaseModal,
  IBaseModalBody,
  IBaseModalContent,
  IBaseModalHeader,
} from "@base/client/components";
import { useQuery } from "@tanstack/react-query";
import { HelpCircle, Loader2 } from "lucide-react";
import { useTranslations } from "next-intl";

interface ProductFormGuideIBaseModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function ProductFormGuideModal({
  isOpen,
  onClose,
}: ProductFormGuideIBaseModalProps) {
  const t = useTranslations("guidelines");
  const {
    data: guideContent,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["guideline", "product-information-needed"],
    queryFn: () => guidelineService.getByKey("product-information-needed"),
    enabled: isOpen, // Only fetch when modal is open
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
  });

  return (
    <IBaseModal
      isOpen={isOpen}
      placement="center"
      scrollBehavior="inside"
      size="5xl"
      onClose={onClose}
    >
      <IBaseModalContent className="max-h-[90vh]">
        <>
          <IBaseModalHeader className="flex items-center gap-2 pb-3">
            <HelpCircle size={18} />
            <span className="text-base">{t("title")}</span>
          </IBaseModalHeader>
          <IBaseModalBody className="pb-4 pt-2">
            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin text-default-500" />
              </div>
            ) : error ? (
              <div className="py-4 text-center text-sm text-default-500">
                {t("error")}
              </div>
            ) : guideContent ? (
              <MarkdownContent content={guideContent} />
            ) : (
              <div className="py-4 text-center text-sm text-default-500">
                {t("notFound")}
              </div>
            )}
          </IBaseModalBody>
        </>
      </IBaseModalContent>
    </IBaseModal>
  );
}
