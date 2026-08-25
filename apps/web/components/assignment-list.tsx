"use client";

import { Check, Search } from "lucide-react";
import { useMemo, useState } from "react";
import { assignments } from "@/lib/demo-data";

const filters = ["All", "Due soon", "In progress", "Not started"] as const;

export function AssignmentList() {
  const [filter, setFilter] = useState<(typeof filters)[number]>("All");
  const [query, setQuery] = useState("");
  const [completed, setCompleted] = useState<string[]>([]);
  const visible = useMemo(
    () =>
      assignments.filter((item) => {
        if (
          !`${item.title} ${item.course}`
            .toLowerCase()
            .includes(query.toLowerCase())
        )
          return false;
        if (filter === "Due soon") return item.urgency !== "normal";
        if (filter === "In progress") return item.progress > 0;
        if (filter === "Not started") return item.progress === 0;
        return true;
      }),
    [filter, query],
  );

  return (
    <>
      <div className="assignment-tools">
        <div className="segmented-control" aria-label="Filter assignments">
          {filters.map((item) => (
            <button
              key={item}
              onClick={() => setFilter(item)}
              aria-pressed={filter === item}
            >
              {item}
            </button>
          ))}
        </div>
        <label className="search-field">
          <Search size={16} />
          <span className="sr-only">Search assignments</span>
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search assignments"
          />
        </label>
      </div>
      {visible.length === 0 ? (
        <div className="empty-state">
          <Check size={26} />
          <h2>No assignments here.</h2>
          <p>Change the filter or search term to see more work.</p>
          <button
            className="button button-secondary"
            onClick={() => {
              setFilter("All");
              setQuery("");
            }}
          >
            Clear filters
          </button>
        </div>
      ) : (
        <div className="assignment-ledger">
          <div className="assignment-header">
            <span>Due</span>
            <span>Assignment</span>
            <span>Weight</span>
            <span>Preparation</span>
            <span />
          </div>
          {visible.map((item) => {
            const done = completed.includes(item.id);
            return (
              <article key={item.id} className={done ? "is-complete" : ""}>
                <span className={`deadline-date ${item.urgency}`}>
                  {item.due}
                </span>
                <span>
                  <strong>{item.title}</strong>
                  <small>
                    {item.course} · {item.type}
                  </small>
                </span>
                <span>{item.weight}</span>
                <span>
                  <span className="progress-inline">
                    <span style={{ width: `${done ? 100 : item.progress}%` }} />
                  </span>
                  <small>
                    {done ? "Complete" : `${item.progress}% prepared`}
                  </small>
                </span>
                <button
                  className="completion-dot"
                  onClick={() =>
                    setCompleted((current) =>
                      done
                        ? current.filter((id) => id !== item.id)
                        : [...current, item.id],
                    )
                  }
                  aria-pressed={done}
                  aria-label={`${done ? "Restore" : "Complete"} ${item.title}`}
                >
                  {done && <Check size={14} />}
                </button>
              </article>
            );
          })}
        </div>
      )}
    </>
  );
}
