"use client";

import { useTranslations } from "next-intl";

export default function CustomerCompanyEditPage(): React.ReactNode {
  const t = useTranslations("b2bSales.customers.company");

  return (
    <div className="space-y-4">
      <h1>{t("edit")}</h1>
      <p>Customer company edit form will be implemented here.</p>
    </div>
  );
}
