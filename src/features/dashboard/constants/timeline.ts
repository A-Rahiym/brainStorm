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
