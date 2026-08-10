export type ScheduleEvent = {
  id: string;
  name: string;
  code?: string;
  description?: string;
  time?: string;
  person?: string;
  tone: "red" | "pink" | "neutral";
};

export type ScheduleBlock = {
  id: string;
  timeLabel: string;
  now?: boolean;
  events: ScheduleEvent[];
  break?: string;
};

export const TIMELINE_MONTH_LABEL = "August 2026";

export const TIMELINE_DAY_STRIP = [
  { dow: "Mon", num: "14" },
  { dow: "Tue", num: "15" },
  { dow: "Wed", num: "16" },
  { dow: "Thu", num: "17" },
  { dow: "Fri", num: "18" },
  { dow: "Sat", num: "19" },
  { dow: "Sun", num: "20" },
];
