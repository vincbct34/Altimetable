const STORAGE_KEY = "altimetable:write-access-token";

export function getWriteAccessToken(): string | null {
  try {
    return localStorage.getItem(STORAGE_KEY);
  } catch {
    return null;
  }
}

export function setWriteAccessToken(token: string): void {
  try {
    localStorage.setItem(STORAGE_KEY, token);
  } catch {
    // localStorage unavailable (private browsing, etc.) — editing just won't persist across reloads
  }
}

export function clearWriteAccessToken(): void {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {
    // ignore
  }
}
