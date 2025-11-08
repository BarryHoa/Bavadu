import dayjs from "dayjs";
import timezone from "dayjs/plugin/timezone";
import utc from "dayjs/plugin/utc";
dayjs.extend(timezone);
dayjs.extend(utc);

/**
 * Format date with time
 * @param date
 * @param timezone
 * @returns
 */
export const formatDateWithTime = (
  date: number | undefined | null | string,
  timezone: string | undefined = "Asia/Ho_Chi_Minh"
) => {
  if (!date) return "";
  const d = dayjs(date).tz(timezone);
  if (!d.isValid()) return "";
  return d.format("DD/MM/YYYY HH:mm");
};
/**
 *
 * @param date
 * @param timezone
 * @returns
 */
export const formatDate = (
  date: number | undefined | null | string,
  timezone: string | undefined = "Asia/Ho_Chi_Minh"
) => {
  if (!date) return "";
  const d = dayjs(date).tz(timezone);
  if (!d.isValid()) return "";
  return d.format("DD/MM/YYYY");
};
