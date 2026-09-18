import type { EventType } from '../api/events'

export const eventTypeLabels: Record<EventType, string> = {
  school: 'School',
  company: 'Company',
  holiday: 'Holiday',
  exam: 'Exam',
  other: 'Other',
}
