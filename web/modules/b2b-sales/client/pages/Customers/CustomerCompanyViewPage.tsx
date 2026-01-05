"use client";

import { useTranslations } from "next-intl";

export default function CustomerCompanyViewPage(): React.ReactNode {
  const t = useTranslations("b2bSales.customers.company");

  return (
    <div className="space-y-4">
      <h1>{t("view")}</h1>
      <p>Customer company view page will be implemented here.</p>
    </div>
  );
}
