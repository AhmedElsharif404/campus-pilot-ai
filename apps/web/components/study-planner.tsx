"use client";

import {
  Check,
  ChevronLeft,
  ChevronRight,
  Clock3,
  GripVertical,
  RotateCcw,
} from "lucide-react";
import { useState } from "react";

const initial = [
  {
    id: "s1",
    day: "Wed 16",
    time: "11:15 AM",
    duration: "45m",
    title: "Problem set 4 · questions 1–6",
    course: "STAT 201",
    reason: "Starts Friday’s deadline early",
    status: "planned",
  },
  {
    id: "s2",
    day: "Wed 16",
    time: "3:30 PM",
    duration: "50m",
    title: "Lab report · draft results",
    course: "BIO 214",
    reason: "High-priority assignment",
    status: "planned",
  },
  {
    id: "s3",
    day: "Thu 17",
    time: "9:00 AM",
    duration: "35m",
    title: "Archive essay · source notes",
    course: "HIST 238",
    reason: "Builds toward Sep 22 draft",
    status: "planned",
  },
  {
    id: "s4",
    day: "Thu 17",
    time: "4:00 PM",
    duration: "55m",
    title: "Lab report · revise figures",
    course: "BIO 214",
    reason: "Second pass before submission",
    status: "planned",
  },
  {
    id: "s5",
    day: "Fri 18",
    time: "10:15 AM",
    duration: "35m",
    title: "Problem set 4 · final check",
    course: "STAT 201",
    reason: "Leaves buffer before deadline",
    status: "planned",
  },
];

export function StudyPlanner() {
  const [sessions, setSessions] = useState(initial);
  const [generated, setGenerated] = useState(false);
  const [loading, setLoading] = useState(false);

  function shift(id: string) {
    setSessions((current) =>
      current.map((item) =>
        item.id === id
          ? { ...item, time: item.time === "3:30 PM" ? "5:00 PM" : "3:30 PM" }
          : item,
      ),
    );
  }
  async function regenerate() {
    setLoading(true);
    await new Promise((resolve) => setTimeout(resolve, 850));
    setGenerated(true);
    setLoading(false);
  }

  return (
    <>
      <div className="plan-toolbar">
        <div>
          <button aria-label="Previous week">
            <ChevronLeft />
          </button>
          <button className="week-control">Sep 14–20</button>
          <button aria-label="Next week">
            <ChevronRight />
          </button>
        </div>
        <button
          className="button button-secondary"
          onClick={() => void regenerate()}
          disabled={loading}
        >
          {loading ? (
            <>
              <RotateCcw className="spin" size={16} /> Rebalancing…
            </>
          ) : (
            <>
              <RotateCcw size={16} /> Rebalance week
            </>
          )}
        </button>
      </div>
      {generated && (
        <div className="success-banner" role="status">
          <Check size={17} />
          <span>
            Friday’s load is now spread across Wednesday and Thursday. No
            confirmed events were moved.
          </span>
        </div>
      )}
      <div className="planner-board">
        <div className="plan-summary">
          <p className="eyebrow">This week</p>
          <h2>6h 10m planned</h2>
          <p>
            12 sessions across four courses, with 1h 25m of unallocated buffer.
          </p>
          <dl>
            <div>
              <dt>Course priority</dt>
              <dd>BIO 214</dd>
            </div>
            <div>
              <dt>Tightest deadline</dt>
              <dd>Fri, 11:59 PM</dd>
            </div>
            <div>
              <dt>Available windows used</dt>
              <dd>7 of 9</dd>
            </div>
          </dl>
          <div className="ai-boundary-note">
            <strong>Plan boundary</strong>
            <p>
              CampusPilot can move suggested study sessions. Classes and
              confirmed deadlines stay fixed until you approve a change.
            </p>
          </div>
        </div>
        <div className="session-list">
          <div className="session-header">
            <span>When</span>
            <span>Suggested session</span>
            <span>Why now</span>
            <span />
          </div>
          {sessions.map((session) => (
            <article key={session.id}>
              <button
                className="drag-handle"
                aria-label={`Move ${session.title}`}
              >
                <GripVertical size={17} />
              </button>
              <span>
                <strong>{session.day}</strong>
                <small>
                  <Clock3 size={13} /> {session.time} · {session.duration}
                </small>
              </span>
              <span>
                <strong>{session.title}</strong>
                <small>{session.course}</small>
              </span>
              <span>{session.reason}</span>
              <button
                className="button-quiet"
                onClick={() => shift(session.id)}
              >
                Move
              </button>
            </article>
          ))}
        </div>
      </div>
    </>
  );
}
