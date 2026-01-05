"use client";

import { useTranslations } from "next-intl";

export default function CustomerCompanyCreatePage(): React.ReactNode {
  const t = useTranslations("b2bSales.customers.company");

  return (
    <div className="space-y-4">
      <h1>{t("create")}</h1>
      <p>Customer company creation form will be implemented here.</p>
    </div>
  );
}
