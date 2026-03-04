import dayjs from "dayjs";

export interface WeekdayItem {
  key: string;
  name: string;
  shortName: string;
}

export function getMonthDays(
  year: number,
  month: number,
): (number | null)[][] {
  const first = dayjs().year(year).month(month - 1).date(1);
  const start = (first.day() + 6) % 7;
  const days = [
    ...Array(start).fill(null),
    ...Array.from({ length: first.daysInMonth() }, (_, i) => i + 1),
  ];

  return Array.from({ length: Math.ceil(days.length / 7) }, (_, i) => {
    const row = days.slice(i * 7, (i + 1) * 7);

    return row.length < 7 ? [...row, ...Array(7 - row.length).fill(null)] : row;
  });
}
