"use client";

import { useTranslations } from "next-intl";

export default function SalesOrderB2CEditPage(): React.ReactNode {
  const t = useTranslations("b2cSales.order.create.labels.edit");
  return (
    <div className="space-y-4">
      <h1>{t("title")}</h1>
      <p>{t("description")}</p>
    </div>
  );
}
