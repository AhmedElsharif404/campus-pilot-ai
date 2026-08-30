"use client";

import {
  CheckCircle2,
  LoaderCircle,
  ShieldCheck,
  UploadCloud,
  XCircle,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useRef, useState } from "react";

type UploadState =
  | "idle"
  | "validating"
  | "uploading"
  | "processing"
  | "success"
  | "error";

export function UploadPanel() {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [state, setState] = useState<UploadState>("idle");
  const [file, setFile] = useState<File | null>(null);
  const [message, setMessage] = useState("");
  const [usingDemoFallback, setUsingDemoFallback] = useState(false);

  function csrfToken() {
    const prefix = "campus_pilot_csrf=";
    const cookie = document.cookie
      .split(";")
      .map((value) => value.trim())
      .find((value) => value.startsWith(prefix));
    return cookie ? decodeURIComponent(cookie.slice(prefix.length)) : null;
  }

  async function accept(candidate?: File) {
    if (!candidate) return;
    if (
      candidate.type !== "application/pdf" ||
      candidate.size > 20 * 1024 * 1024
    ) {
      setState("error");
      setMessage(
        candidate.type !== "application/pdf"
          ? "Choose a PDF file. Other document types are not accepted yet."
          : "This PDF is larger than the 20 MB upload limit.",
      );
      return;
    }
    setFile(candidate);
    setUsingDemoFallback(false);
    setState("validating");
    await new Promise((resolve) => setTimeout(resolve, 450));
    setState("uploading");
    try {
      const body = new FormData();
      body.append("file", candidate);
      const headers = new Headers({ "Idempotency-Key": crypto.randomUUID() });
      const csrf = csrfToken();
      if (csrf) headers.set("X-CSRF-Token", csrf);
      const response = await fetch("/api/v1/documents", {
        method: "POST",
        body,
        headers,
      });
      if (!response.ok) throw new Error("API unavailable");
      setState("processing");
      await new Promise((resolve) => setTimeout(resolve, 900));
      setState("success");
    } catch {
      if (process.env.NEXT_PUBLIC_DEMO_FALLBACK !== "true") {
        setState("error");
        setMessage(
          "The document service could not be reached. Start the API and try again.",
        );
        return;
      }
      setUsingDemoFallback(true);
      setState("processing");
      await new Promise((resolve) => setTimeout(resolve, 1000));
      setState("success");
    }
  }

  if (state !== "idle" && state !== "error") {
    return (
      <section className="processing-sheet" aria-live="polite">
        <div
          className={`processing-icon ${state === "success" ? "success" : ""}`}
        >
          {state === "success" ? (
            <CheckCircle2 size={30} />
          ) : (
            <LoaderCircle className="spin" size={30} />
          )}
        </div>
        <p className="eyebrow">
          {state === "success" ? "Ready for review" : "Document intake"}
        </p>
        <h2>{file?.name}</h2>
        <ol className="processing-steps">
          <li className="done">
            <CheckCircle2 /> File and MIME validated
          </li>
          <li className={state === "validating" ? "active" : "done"}>
            <CheckCircle2 />{" "}
            {usingDemoFallback
              ? "Demo fixture selected — no upload performed"
              : "Secure upload complete"}
          </li>
          <li
            className={
              state === "processing"
                ? "active"
                : state === "success"
                  ? "done"
                  : ""
            }
          >
            {state === "processing" ? (
              <LoaderCircle className="spin" />
            ) : (
              <CheckCircle2 />
            )}{" "}
            {usingDemoFallback
              ? "Bundled synthetic extraction loaded"
              : "Pages parsed and fields extracted"}
          </li>
          <li className={state === "success" ? "done" : ""}>
            <CheckCircle2 />{" "}
            {usingDemoFallback
              ? "Demo result ready for review"
              : "Structured result validated"}
          </li>
        </ol>
        {state === "success" ? (
          <>
            {usingDemoFallback && (
              <p className="demo-notice" role="status">
                Demo mode: the API was unavailable, so the next screen uses
                bundled synthetic syllabus data. Your selected file stayed in
                this browser and was not uploaded.
              </p>
            )}
            <button
              className="button"
              onClick={() => router.push("/app/review/demo")}
            >
              Review extracted details
            </button>
          </>
        ) : (
          <p className="processing-time">
            Usually less than one minute. You can safely leave this page.
          </p>
        )}
      </section>
    );
  }

  return (
    <section>
      <div
        className={`upload-zone ${state === "error" ? "has-error" : ""}`}
        onDragOver={(event) => event.preventDefault()}
        onDrop={(event) => {
          event.preventDefault();
          void accept(event.dataTransfer.files[0]);
        }}
      >
        <input
          ref={inputRef}
          type="file"
          accept="application/pdf"
          onChange={(event) => void accept(event.target.files?.[0])}
          className="sr-only"
          id="syllabus-file"
        />
        <UploadCloud size={31} />
        <h2>Drop a syllabus PDF here</h2>
        <p>
          or{" "}
          <button
            className="inline-button"
            onClick={() => inputRef.current?.click()}
          >
            choose a file
          </button>{" "}
          from your device
        </p>
        <small>
          PDF only · 20 MB maximum · multiple files can be added one at a time
        </small>
      </div>
      {state === "error" && (
        <div className="form-error" role="alert">
          <XCircle size={18} />
          <span>{message}</span>
          <button onClick={() => setState("idle")}>Try again</button>
        </div>
      )}
      <div className="upload-trust">
        <ShieldCheck size={19} />
        <div>
          <strong>
            Your document is treated as source material, never as instructions.
          </strong>
          <p>
            CampusPilot validates the file, isolates document text from system
            prompts, and waits for your approval before creating academic
            records.
          </p>
        </div>
      </div>
    </section>
  );
}
