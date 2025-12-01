import dayjs from "dayjs";
import SalesOrderB2CCreatePageClient from "./SalesOrderB2CCreatePageClient";

export default async function SalesOrderB2CCreatePageSSR() {
  // Server-side data fetching can be added here if needed
  // For example: fetching initial data, checking permissions, etc.
  const props = {
    currency: "VND",
    customerName: "Khách lẻ",
    orderDate: dayjs().format("YYYY-MM-DD HH:mm:ss"),
  };

  return <SalesOrderB2CCreatePageClient {...props} />;
}
