import { useCallback, useEffect, useMemo, useState } from 'react'
import { Calendar, luxonLocalizer, type SlotInfo, type View } from 'react-big-calendar'
import { DateTime } from 'luxon'
import 'react-big-calendar/lib/css/react-big-calendar.css'
import {
  createEvent,
  deleteEvent,
  fetchEvents,
  updateEvent,
  WriteAccessError,
  type ApiEvent,
  type EventInput,
} from '../api/events'
import { eventTypeLabels } from '../lib/eventTypeStyles'
import { useWriteAccess } from '../hooks/useWriteAccess'
import { WriteAccessControl } from './WriteAccessControl'
import { EventForm } from './EventForm'
import './PlanningCalendar.css'

const localizer = luxonLocalizer(DateTime, { firstDayOfWeek: 1 })
// No "week" view: every event here is all-day, so react-big-calendar's week
// view would just show an empty hour-by-hour grid with nothing timed on it.
const views: View[] = ['month', 'agenda']

interface CalendarEvent {
  title: string
  start: Date
  end: Date
  allDay: true
  resource: ApiEvent
}

type FormState =
  | { mode: 'create'; range: { start: Date; end: Date } }
  | { mode: 'edit'; event: ApiEvent }

function parseDateOnly(value: string): Date {
  const [year, month, day] = value.split('-').map(Number)
  return new Date(year, month - 1, day)
}

function addDays(date: Date, days: number): Date {
  const result = new Date(date)
  result.setDate(result.getDate() + days)
  return result
}

function isWeekend(date: Date): boolean {
  const day = date.getDay()
  return day === 0 || day === 6
}

// Splits a date range into its consecutive weekday-only runs, so a period
// spanning several weeks (e.g. a month-long company block) renders as one
// bar per work-week instead of one bar that visually paints through the
// weekends in between — nobody is at school or the company on a Saturday.
function weekdayRuns(start: Date, end: Date): Array<{ start: Date; end: Date }> {
  const runs: Array<{ start: Date; end: Date }> = []
  let runStart: Date | null = null
  let cursor = new Date(start)

  while (cursor <= end) {
    if (isWeekend(cursor)) {
      if (runStart) {
        runs.push({ start: runStart, end: addDays(cursor, -1) })
        runStart = null
      }
    } else if (!runStart) {
      runStart = new Date(cursor)
    }
    cursor = addDays(cursor, 1)
  }
  if (runStart) {
    runs.push({ start: runStart, end: addDays(cursor, -1) })
  }
  return runs
}

function toCalendarEvents(event: ApiEvent): CalendarEvent[] {
  const start = parseDateOnly(event.startDate)
  const end = parseDateOnly(event.endDate)
  // react-big-calendar treats an all-day event's end as exclusive,
  // so the inclusive endDate from the API needs a day added to render fully.

  // Holidays are specific calendar days regardless of weekday (some public
  // holidays land on a Saturday), so they're never split.
  if (event.type === 'holiday') {
    return [{ title: event.title, start, end: addDays(end, 1), allDay: true, resource: event }]
  }

  return weekdayRuns(start, end).map((run) => ({
    title: event.title,
    start: run.start,
    end: addDays(run.end, 1),
    allDay: true,
    resource: event,
  }))
}

function EventContent({ event }: { event: CalendarEvent }) {
  return (
    <span className="planning-event">
      <span className="planning-event-tag">{eventTypeLabels[event.resource.type]}</span>
      {event.title}
    </span>
  )
}

// react-big-calendar's agenda view decorates this label with « / » to show
// whether an event continues from/into an adjacent day. Every event here is
// all-day already, and with two overlapping events on the same date (e.g. a
// multi-week company block plus a public holiday) the two continuation states
// can differ, so the same date shows two inconsistent-looking labels. Always
// rendering a plain "All day" avoids that confusing, broken-looking mismatch.
function AgendaTime() {
  return <>All day</>
}

export function PlanningCalendar() {
  const { token, isUnlocked, unlock, lock } = useWriteAccess()
  const [events, setEvents] = useState<ApiEvent[] | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [formState, setFormState] = useState<FormState | null>(null)
  // react-big-calendar's own uncontrolled date/view state (via the `uncontrollable`
  // package) doesn't propagate re-renders under React 19, so Month/Week/Agenda and
  // Today/Back/Next silently no-op unless date/view are controlled here instead.
  const [calendarDate, setCalendarDate] = useState(new Date())
  const [calendarView, setCalendarView] = useState<View>('month')

  const loadEvents = useCallback(async () => {
    try {
      const data = await fetchEvents()
      setEvents(data)
      setError(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error')
    }
  }, [])

  useEffect(() => {
    fetchEvents()
      .then((data) => {
        setEvents(data)
        setError(null)
      })
      .catch((err: unknown) => {
        setError(err instanceof Error ? err.message : 'Unknown error')
      })
  }, [])

  const calendarEvents = useMemo(() => (events ?? []).flatMap(toCalendarEvents), [events])

  const handleSelectSlot = useCallback(
    (slot: SlotInfo) => {
      if (!isUnlocked) return
      setFormState({
        mode: 'create',
        range: { start: slot.start, end: addDays(slot.end, -1) },
      })
    },
    [isUnlocked]
  )

  const handleSelectEvent = useCallback(
    (event: CalendarEvent) => {
      if (!isUnlocked) return
      setFormState({ mode: 'edit', event: event.resource })
    },
    [isUnlocked]
  )

  async function withWriteAccess(action: (token: string) => Promise<unknown>) {
    if (!token) throw new WriteAccessError()

    try {
      await action(token)
    } catch (err) {
      if (err instanceof WriteAccessError) {
        lock()
      }
      throw err
    }

    await loadEvents()
  }

  return (
    <div className="planning-calendar">
      <div className="planning-calendar-toolbar">
        <p className="planning-calendar-legend">
          {Object.values(eventTypeLabels).join(' · ')}
        </p>

        <div className="planning-calendar-toolbar-actions">
          {isUnlocked && (
            <button
              type="button"
              className="planning-calendar-add"
              onClick={() => {
                const today = new Date()
                setFormState({ mode: 'create', range: { start: today, end: today } })
              }}
            >
              Add event
            </button>
          )}
          <WriteAccessControl isUnlocked={isUnlocked} onUnlock={unlock} onLock={lock} />
        </div>
      </div>

      {error && <p className="planning-calendar-error">Could not load the planning — {error}</p>}

      <Calendar
        localizer={localizer}
        events={calendarEvents}
        startAccessor="start"
        endAccessor="end"
        views={views}
        components={{ event: EventContent, agenda: { time: AgendaTime } }}
        tooltipAccessor={(event) => `${event.title} (${eventTypeLabels[event.resource.type]})`}
        style={{ height: 'calc(100vh - 260px)' }}
        date={calendarDate}
        view={calendarView}
        onNavigate={setCalendarDate}
        onView={setCalendarView}
        selectable={isUnlocked}
        onSelectSlot={handleSelectSlot}
        onSelectEvent={handleSelectEvent}
        popup
      />

      {events === null && !error && <p className="planning-calendar-loading">Loading planning…</p>}

      {formState && (
        <EventForm
          event={formState.mode === 'edit' ? formState.event : null}
          defaultRange={formState.mode === 'create' ? formState.range : null}
          onClose={() => setFormState(null)}
          onSubmit={(payload: EventInput) =>
            withWriteAccess((accessToken) =>
              formState.mode === 'edit'
                ? updateEvent(accessToken, formState.event.id, payload)
                : createEvent(accessToken, payload)
            )
          }
          onDelete={
            formState.mode === 'edit'
              ? () => withWriteAccess((accessToken) => deleteEvent(accessToken, formState.event.id))
              : undefined
          }
        />
      )}
    </div>
  )
}
