import { getRequestConfig, GetRequestConfigParams } from "next-intl/server";
import { notFound } from "next/navigation";

// Can be imported from a shared config
const locales = ["en", "vi"];

const getImportMessages = async ({ locale }: GetRequestConfigParams) => {
  if (!locales.includes(locale as any)) notFound();
  return (await import(`./messages/${locale}.json`)).default;
};

export default getRequestConfig(getImportMessages);
