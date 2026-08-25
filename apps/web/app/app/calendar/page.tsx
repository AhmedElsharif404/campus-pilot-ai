import { ChevronLeft, ChevronRight, SlidersHorizontal } from "lucide-react";

const days = [
  { n: 30, outside: true },
  { n: 31, outside: true },
  { n: 1 },
  { n: 2 },
  { n: 3 },
  { n: 4 },
  { n: 5 },
  { n: 6 },
  { n: 7 },
  { n: 8 },
  { n: 9 },
  { n: 10 },
  { n: 11 },
  { n: 12 },
  { n: 13 },
  { n: 14 },
  { n: 15 },
  { n: 16, today: true },
  { n: 17 },
  { n: 18 },
  { n: 19 },
  { n: 20 },
  { n: 21 },
  { n: 22 },
  { n: 23 },
  { n: 24 },
  { n: 25 },
  { n: 26 },
  { n: 27 },
  { n: 28 },
  { n: 29 },
  { n: 30 },
  { n: 1, outside: true },
  { n: 2, outside: true },
  { n: 3, outside: true },
];

const events: Record<
  number,
  { title: string; course: string; type: "assignment" | "exam" | "reading" }[]
> = {
  3: [{ title: "Field observation", course: "ENGL 170", type: "reading" }],
  8: [{ title: "Quiz 2", course: "STAT 201", type: "exam" }],
  11: [{ title: "Membrane reading", course: "BIO 214", type: "reading" }],
  16: [{ title: "Reading response", course: "HIST 238", type: "assignment" }],
  18: [{ title: "Lab report", course: "BIO 214", type: "assignment" }],
  19: [{ title: "Problem set 4", course: "STAT 201", type: "assignment" }],
  22: [
    { title: "Archive essay draft", course: "HIST 238", type: "assignment" },
  ],
  24: [{ title: "Field notes", course: "ENGL 170", type: "assignment" }],
  29: [{ title: "Cell signaling quiz", course: "BIO 214", type: "exam" }],
};

export const metadata = { title: "Semester calendar" };

export default function CalendarPage() {
  return (
    <div className="workspace-page calendar-page">
      <header className="workspace-page-header calendar-header">
        <div>
          <p className="date-line">Fall 2026</p>
          <h1>September</h1>
        </div>
        <div className="calendar-controls">
          <button aria-label="Previous month">
            <ChevronLeft />
          </button>
          <button className="today-control">Today</button>
          <button aria-label="Next month">
            <ChevronRight />
          </button>
          <button className="filter-control">
            <SlidersHorizontal size={16} /> Filter
          </button>
        </div>
      </header>
      <div className="calendar-legend">
        <span>
          <i className="legend-assignment" /> Assignment
        </span>
        <span>
          <i className="legend-exam" /> Exam or quiz
        </span>
        <span>
          <i className="legend-reading" /> Reading
        </span>
      </div>
      <section className="month-grid" aria-label="September 2026 calendar">
        <div className="weekday-row">
          {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((day) => (
            <span key={day}>{day}</span>
          ))}
        </div>
        <div className="calendar-days">
          {days.map((day, index) => (
            <article
              key={`${day.n}-${index}`}
              className={`${day.outside ? "outside" : ""} ${day.today ? "today" : ""}`}
            >
              <div className="day-number">
                <span>{day.n}</span>
                {day.today && <small>Today</small>}
              </div>
              {!day.outside &&
                (events[day.n] ?? []).map((event) => (
                  <button
                    key={event.title}
                    className={`calendar-event event-${event.type}`}
                  >
                    <strong>{event.title}</strong>
                    <span>{event.course}</span>
                  </button>
                ))}
            </article>
          ))}
        </div>
      </section>
      <aside className="calendar-warning">
        <strong>Pressure window · Sep 18–19</strong>
        <span>
          Two weighted assignments land within 24 hours. Your study plan begins
          both on Sep 16.
        </span>
      </aside>
    </div>
  );
}
