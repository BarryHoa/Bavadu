import { getRequestConfig, GetRequestConfigParams } from "next-intl/server";
import { notFound } from "next/navigation";

// Can be imported from a shared config
const locales = ["en", "vi"];

export default getRequestConfig(async ({ locale }: GetRequestConfigParams) => {
  if (!locale || !locales.includes(locale)) notFound();

  return {
    locale: locale as string,
    messages: {},
    timeZone: "Asia/Ho_Chi_Minh",
  };
});
