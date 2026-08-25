"use client";

import { Check, Circle, Clock3, MapPin, RotateCcw } from "lucide-react";
import { useState } from "react";
import type { AgendaItem } from "@/lib/demo-data";
import { queueOfflineAction } from "@/lib/offline";

export function TodayAgenda({ initialItems }: { initialItems: AgendaItem[] }) {
  const [items, setItems] = useState(initialItems);
  const [message, setMessage] = useState("");

  async function toggle(id: string) {
    setItems((current) =>
      current.map((item) =>
        item.id === id ? { ...item, completed: !item.completed } : item,
      ),
    );
    const completed = !items.find((item) => item.id === id)?.completed;
    setMessage(
      completed ? "Study session marked complete." : "Study session restored.",
    );
    if (!navigator.onLine)
      await queueOfflineAction({
        type: "study-session.toggle",
        payload: { id, completed },
      });
  }

  return (
    <div className="agenda-timeline">
      <div className="sr-only" aria-live="polite">
        {message}
      </div>
      {items.map((item) => (
        <article
          key={item.id}
          className={`agenda-row agenda-${item.kind} ${item.completed ? "is-complete" : ""}`}
        >
          <div className="agenda-time">
            <strong>{item.time}</strong>
            <span>{item.duration}</span>
          </div>
          <div className="timeline-mark">
            <span />
          </div>
          <div className="agenda-content">
            <div className="agenda-meta">
              <span
                className={`course-mark course-${item.courseCode.toLowerCase().replace(" ", "-")}`}
              >
                {item.courseCode}
              </span>
              <span>
                {item.kind === "study"
                  ? "Study session"
                  : item.kind === "deadline"
                    ? "Deadline"
                    : "Class"}
              </span>
            </div>
            <h3>{item.title}</h3>
            <p>
              {item.kind === "class" ? (
                <MapPin size={14} />
              ) : (
                <Clock3 size={14} />
              )}
              {item.note}
            </p>
          </div>
          {item.kind === "study" && (
            <button
              className="completion-button"
              onClick={() => void toggle(item.id)}
              aria-pressed={item.completed}
            >
              {item.completed ? <RotateCcw size={17} /> : <Circle size={17} />}
              <span>{item.completed ? "Undo" : "Complete"}</span>
            </button>
          )}
          {item.kind === "deadline" && (
            <span className="deadline-flag">Due today</span>
          )}
        </article>
      ))}
      <div className="agenda-finish">
        <Check size={17} />
        <span>That’s the whole plan for today.</span>
      </div>
    </div>
  );
}
