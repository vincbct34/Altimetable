import { useState } from "react";
import {
  clearWriteAccessToken,
  getWriteAccessToken,
  setWriteAccessToken,
} from "../lib/writeAccess";

export function useWriteAccess() {
  const [token, setToken] = useState<string | null>(() =>
    getWriteAccessToken(),
  );

  function unlock(value: string) {
    setWriteAccessToken(value);
    setToken(value);
  }

  function lock() {
    clearWriteAccessToken();
    setToken(null);
  }

  return { token, isUnlocked: token !== null, unlock, lock };
}
