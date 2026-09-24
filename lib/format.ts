const TIME_ZONE = "America/Argentina/Buenos_Aires";
const DAY_MS = 24 * 60 * 60 * 1000;

const dayMonth = new Intl.DateTimeFormat("es-AR", { day: "numeric", month: "long", timeZone: TIME_ZONE });
const dayMonthYear = new Intl.DateTimeFormat("es-AR", {
  day: "numeric",
  month: "long",
  year: "numeric",
  timeZone: TIME_ZONE,
});
const weekdayDayMonth = new Intl.DateTimeFormat("es-AR", {
  weekday: "long",
  day: "numeric",
  month: "long",
  timeZone: TIME_ZONE,
});
const calendarDay = new Intl.DateTimeFormat("en-CA", { timeZone: TIME_ZONE });
const yearOnly = new Intl.DateTimeFormat("en-CA", { year: "numeric", timeZone: TIME_ZONE });

/** Reads like a person would say it: "hoy", "ayer", "hace 3 días", "el 2 de septiembre". */
export function formatRelativeDay(timestamp: string, now: Date = new Date()): string {
  const date = new Date(timestamp);
  const days = Math.round((startOfDay(now) - startOfDay(date)) / DAY_MS);

  if (days === 0) return "hoy";
  if (days === 1) return "ayer";
  if (days > 1 && days < 7) return `hace ${days} días`;

  const sameYear = yearOnly.format(date) === yearOnly.format(now);
  return `el ${(sameYear ? dayMonth : dayMonthYear).format(date)}`;
}

/** "jueves 24 de septiembre" */
export function formatLongDate(date: Date): string {
  return weekdayDayMonth.format(date).replace(",", "");
}

export function formatAverage(average: number): string {
  return average.toLocaleString("es-AR", { minimumFractionDigits: 1, maximumFractionDigits: 2 });
}

export function formatPercent(ratio: number): string {
  return ratio.toLocaleString("es-AR", { style: "percent", maximumFractionDigits: 0 });
}

// Calendar day in Buenos Aires, as a UTC timestamp, so "ayer" means the
// previous calendar day there and not "24 hours ago".
function startOfDay(date: Date): number {
  return new Date(`${calendarDay.format(date)}T00:00:00Z`).getTime();
}
