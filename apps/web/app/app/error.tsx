"use client";

import { TriangleAlert } from "lucide-react";
import { useEffect } from "react";

export default function WorkspaceError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);
  return (
    <div className="workspace-page">
      <div className="error-state">
        <TriangleAlert size={28} />
        <p className="eyebrow">Workspace interrupted</p>
        <h1>We couldn’t load this part of the semester.</h1>
        <p>
          Your confirmed academic data has not been changed. Try the request
          again.
        </p>
        <button className="button" onClick={reset}>
          Try again
        </button>
      </div>
    </div>
  );
}
