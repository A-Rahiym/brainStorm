import type { ScheduleBlock } from "@/features/dashboard/constants/timeline";

export const TEACHER_BLOCKS: ScheduleBlock[] = [
  { id: "t08", timeLabel: "08:00", events: [] },
  {
    id: "t09",
    timeLabel: "09:00",
    now: true,
    events: [
      { id: "e1", name: "English", code: "DP", description: "Phonetics", time: "8:30 - 10:00", person: "Mr. Salis", tone: "red" },
    ],
  },
  {
    id: "t10",
    timeLabel: "10:00",
    events: [
      { id: "e2", name: "Mathematics", code: "DP", description: "Numbers & sequences", time: "10:00 - 11:30", person: "Me", tone: "pink" },
    ],
  },
  { id: "t11", timeLabel: "11:00", events: [], break: "11:30 - 12:00" },
  {
    id: "t12",
    timeLabel: "12:00",
    events: [
      { id: "e3", name: "Civic Education", code: "SP", time: "12:00 - 12:45", person: "Mr. Abubakar", tone: "red" },
    ],
  },
  {
    id: "t13",
    timeLabel: "01:00",
    events: [
      { id: "e4", name: "History", code: "SP", time: "12:00 - 12:45", person: "Mr. Abubakar", tone: "red" },
    ],
  },
  { id: "t14", timeLabel: "02:00", events: [] },
  { id: "t15", timeLabel: "03:00", events: [] },
  { id: "t16", timeLabel: "04:00", events: [] },
];

export const HEADMASTER_BLOCKS: ScheduleBlock[] = [
  { id: "t08", timeLabel: "08:00", events: [] },
  {
    id: "t09",
    timeLabel: "09:00",
    events: [
      { id: "e1", name: "Staff meeting", description: "How to improve student recor...", time: "8:30 - 10:00", tone: "red" },
    ],
  },
  { id: "t10", timeLabel: "10:00", events: [] },
  {
    id: "t11",
    timeLabel: "11:00",
    events: [
      { id: "e2", name: "Contact Parent", description: "How to improve student recor...", time: "8:30 - 10:00", tone: "red" },
    ],
    break: "11:30 - 12:00",
  },
  { id: "t12", timeLabel: "12:00", events: [] },
  { id: "t13", timeLabel: "01:00", events: [] },
  { id: "t14", timeLabel: "02:00", events: [] },
  { id: "t15", timeLabel: "03:00", events: [] },
  { id: "t16", timeLabel: "04:00", events: [] },
  { id: "t17", timeLabel: "05:00", events: [] },
];
