export const eventTypes = [
  "school",
  "company",
  "holiday",
  "exam",
  "other",
] as const;

export type EventType = (typeof eventTypes)[number];

export interface ApiEvent {
  id: number;
  title: string;
  type: EventType;
  startDate: string;
  endDate: string;
}

export interface EventInput {
  title: string;
  type: EventType;
  startDate: string;
  endDate: string;
}

export class WriteAccessError extends Error {
  constructor() {
    super("Your write access token was rejected.");
    this.name = "WriteAccessError";
  }
}

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3333";

async function parseErrorMessage(response: Response): Promise<string> {
  try {
    const body = (await response.json()) as { errors?: { message: string }[] };
    if (body.errors?.length) {
      return body.errors.map((error) => error.message).join(", ");
    }
  } catch {
    // response body wasn't JSON, fall through to the generic message
  }

  return `Request failed (status ${response.status})`;
}

export async function fetchEvents(): Promise<ApiEvent[]> {
  const response = await fetch(`${API_URL}/events`);

  if (!response.ok) {
    throw new Error(await parseErrorMessage(response));
  }

  return response.json();
}

async function writeRequest(
  method: "POST" | "PUT" | "DELETE",
  path: string,
  token: string,
  payload?: EventInput,
): Promise<Response> {
  const response = await fetch(`${API_URL}${path}`, {
    method,
    headers: {
      Authorization: `Bearer ${token}`,
      ...(payload ? { "Content-Type": "application/json" } : {}),
    },
    body: payload ? JSON.stringify(payload) : undefined,
  });

  if (response.status === 401) {
    throw new WriteAccessError();
  }

  if (!response.ok) {
    throw new Error(await parseErrorMessage(response));
  }

  return response;
}

export async function createEvent(
  token: string,
  payload: EventInput,
): Promise<ApiEvent> {
  const response = await writeRequest("POST", "/events", token, payload);
  return response.json();
}

export async function updateEvent(
  token: string,
  id: number,
  payload: EventInput,
): Promise<ApiEvent> {
  const response = await writeRequest("PUT", `/events/${id}`, token, payload);
  return response.json();
}

export async function deleteEvent(token: string, id: number): Promise<void> {
  await writeRequest("DELETE", `/events/${id}`, token);
}
