import { useState } from "react";
import "./WriteAccessControl.css";

interface WriteAccessControlProps {
  isUnlocked: boolean;
  onUnlock: (token: string) => void;
  onLock: () => void;
}

export function WriteAccessControl({
  isUnlocked,
  onUnlock,
  onLock,
}: WriteAccessControlProps) {
  const [pendingToken, setPendingToken] = useState("");
  const [isEditingToken, setIsEditingToken] = useState(false);

  if (isUnlocked) {
    return (
      <div className="write-access-control">
        <span className="write-access-status">Editing unlocked</span>
        <button type="button" onClick={onLock}>
          Lock
        </button>
      </div>
    );
  }

  if (!isEditingToken) {
    return (
      <div className="write-access-control">
        <button type="button" onClick={() => setIsEditingToken(true)}>
          Unlock editing
        </button>
      </div>
    );
  }

  return (
    <form
      className="write-access-control"
      onSubmit={(e) => {
        e.preventDefault();
        if (!pendingToken.trim()) return;
        onUnlock(pendingToken.trim());
        setPendingToken("");
        setIsEditingToken(false);
      }}
    >
      <input
        type="password"
        autoFocus
        placeholder="Access token"
        value={pendingToken}
        onChange={(e) => setPendingToken(e.target.value)}
      />
      <button type="submit">Unlock</button>
      <button type="button" onClick={() => setIsEditingToken(false)}>
        Cancel
      </button>
    </form>
  );
}
