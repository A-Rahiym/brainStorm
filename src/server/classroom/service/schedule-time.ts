export type DayOfWeekName = "MONDAY" | "TUESDAY" | "WEDNESDAY" | "THURSDAY" | "FRIDAY";

const DOW_BY_INDEX = ["SUNDAY", "MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY", "SATURDAY"] as const;

/**
 * Determines the school-timetable weekday name for a given date, treating weekends as
 * non-school days.
 * @param date - the date to resolve
 * @returns the weekday name (MONDAY through FRIDAY), or null if `date` falls on a Saturday or Sunday
 */
export function dayOfWeekOf(date: Date): DayOfWeekName | null {
  const dow = DOW_BY_INDEX[date.getDay()];
  return dow === "SUNDAY" || dow === "SATURDAY" ? null : dow;
}

/**
 * Strips the time-of-day component from a date, using local time.
 * @param date - the date/time to truncate
 * @returns a new Date set to midnight local time on the same calendar day
 */
export function dateOnly(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

/**
 * Checks whether two dates fall on the same calendar day, ignoring time of day.
 * @param a - the first date/time
 * @param b - the second date/time
 * @returns true if both dates share the same calendar day, false otherwise
 */
export function isSameDate(a: Date, b: Date): boolean {
  return dateOnly(a).getTime() === dateOnly(b).getTime();
}

/**
 * Computes the number of minutes elapsed since local midnight for a given date/time.
 * @param date - the date/time to measure
 * @returns the minute-of-day offset (0-1439), based on local hours and minutes
 */
export function minutesOfDay(date: Date): number {
  return date.getHours() * 60 + date.getMinutes();
}

/**
 * Formats a date's local time-of-day as a zero-padded "HH:mm" string.
 * @param date - the date/time to format
 * @returns the time formatted as "HH:mm" (24-hour clock)
 */
export function formatTime(date: Date): string {
  return `${String(date.getHours()).padStart(2, "0")}:${String(date.getMinutes()).padStart(2, "0")}`;
}
