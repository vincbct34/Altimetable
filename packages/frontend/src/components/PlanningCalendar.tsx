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
const views: View[] = ['month', 'week', 'agenda']

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

function toCalendarEvent(event: ApiEvent): CalendarEvent {
  return {
    title: event.title,
    // react-big-calendar treats an all-day event's end as exclusive,
    // so the inclusive endDate from the API needs a day added to render fully.
    start: parseDateOnly(event.startDate),
    end: addDays(parseDateOnly(event.endDate), 1),
    allDay: true,
    resource: event,
  }
}

function EventContent({ event }: { event: CalendarEvent }) {
  return (
    <span className="planning-event">
      <span className="planning-event-tag">{eventTypeLabels[event.resource.type]}</span>
      {event.title}
    </span>
  )
}

export function PlanningCalendar() {
  const { token, isUnlocked, unlock, lock } = useWriteAccess()
  const [events, setEvents] = useState<ApiEvent[] | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [formState, setFormState] = useState<FormState | null>(null)

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

  const calendarEvents = useMemo(() => (events ?? []).map(toCalendarEvent), [events])

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
        defaultView="month"
        components={{ event: EventContent }}
        tooltipAccessor={(event) => `${event.title} (${eventTypeLabels[event.resource.type]})`}
        style={{ height: 'calc(100vh - 260px)' }}
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
