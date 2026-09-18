import type { EventType } from "../api/events";

export const eventTypeLabels: Record<EventType, string> = {
  school: "School",
  company: "Company",
  holiday: "Holiday",
  exam: "Exam",
  other: "Other",
};

export const eventTypeColors: Record<EventType, string> = {
  school: "#3b82f6",
  company: "#aa3bff",
  holiday: "#22c55e",
  exam: "#ef4444",
  other: "#6b7280",
};
