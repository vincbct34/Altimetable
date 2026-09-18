import { useEffect, useId, useRef, useState, type FormEvent } from "react";
import {
  eventTypes,
  type ApiEvent,
  type EventInput,
  type EventType,
} from "../api/events";
import { eventTypeLabels } from "../lib/eventTypeStyles";
import "./EventForm.css";

interface EventFormProps {
  event: ApiEvent | null;
  defaultRange: { start: Date; end: Date } | null;
  onClose: () => void;
  onSubmit: (payload: EventInput) => Promise<void>;
  onDelete?: () => Promise<void>;
}

function formatDateInput(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function EventForm({
  event,
  defaultRange,
  onClose,
  onSubmit,
  onDelete,
}: EventFormProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const titleId = useId();

  const [title, setTitle] = useState(event?.title ?? "");
  const [type, setType] = useState<EventType>(event?.type ?? "school");
  const [startDate, setStartDate] = useState(
    event?.startDate ??
      (defaultRange ? formatDateInput(defaultRange.start) : ""),
  );
  const [endDate, setEndDate] = useState(
    event?.endDate ?? (defaultRange ? formatDateInput(defaultRange.end) : ""),
  );
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    dialogRef.current?.showModal();
  }, []);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      await onSubmit({ title, type, startDate, endDate });
      dialogRef.current?.close();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
      setIsSubmitting(false);
    }
  }

  async function handleDelete() {
    if (!onDelete || !window.confirm("Delete this event?")) return;
    setError(null);
    setIsSubmitting(true);

    try {
      await onDelete();
      dialogRef.current?.close();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
      setIsSubmitting(false);
    }
  }

  return (
    <dialog
      ref={dialogRef}
      className="event-form-dialog"
      onClose={onClose}
      aria-labelledby={titleId}
    >
      <form className="event-form" onSubmit={handleSubmit}>
        <h2 id={titleId}>{event ? "Edit event" : "New event"}</h2>

        <label>
          Title
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            autoFocus
          />
        </label>

        <label>
          Type
          <select
            value={type}
            onChange={(e) => setType(e.target.value as EventType)}
          >
            {eventTypes.map((eventType) => (
              <option key={eventType} value={eventType}>
                {eventTypeLabels[eventType]}
              </option>
            ))}
          </select>
        </label>

        <div className="event-form-dates">
          <label>
            Start
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              required
            />
          </label>
          <label>
            End
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              required
            />
          </label>
        </div>

        {error && (
          <p className="event-form-error" role="alert">
            {error}
          </p>
        )}

        <div className="event-form-actions">
          {event && (
            <button
              type="button"
              className="event-form-delete"
              onClick={handleDelete}
              disabled={isSubmitting}
            >
              Delete
            </button>
          )}
          <button
            type="button"
            onClick={() => dialogRef.current?.close()}
            disabled={isSubmitting}
          >
            Cancel
          </button>
          <button type="submit" disabled={isSubmitting}>
            Save
          </button>
        </div>
      </form>
    </dialog>
  );
}
