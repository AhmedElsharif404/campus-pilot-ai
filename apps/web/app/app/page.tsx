import Link from "next/link";
import { ArrowRight, BookOpen, CalendarDays, FileText } from "lucide-react";
import { assignments, courses } from "@/lib/demo-data";

export const metadata = { title: "Fall 2026 semester" };

export default function SemesterPage() {
  return (
    <div className="workspace-page">
      <header className="workspace-page-header semester-header">
        <div>
          <p className="date-line">Fall 2026 · Week 4 of 16</p>
          <h1>Your semester, in working order.</h1>
          <p>
            Four courses, 38 confirmed academic events, and one extraction
            awaiting review.
          </p>
        </div>
        <Link className="button" href="/app/upload">
          Import syllabus
        </Link>
      </header>
      <section className="semester-band" aria-label="Semester at a glance">
        <div>
          <span>Next deadline</span>
          <strong>Today · 6:00 PM</strong>
          <p>HIST 238 reading response</p>
        </div>
        <div>
          <span>Focused this week</span>
          <strong>5h 25m</strong>
          <p>7 of 11 sessions complete</p>
        </div>
        <div>
          <span>Planning pressure</span>
          <strong>Friday afternoon</strong>
          <p>Two deadlines within 24 hours</p>
        </div>
      </section>
      <section className="overview-section">
        <div className="content-heading">
          <div>
            <p className="eyebrow">Course desk</p>
            <h2>Courses</h2>
          </div>
          <Link href="/app/calendar">
            Semester calendar <ArrowRight size={15} />
          </Link>
        </div>
        <div className="course-ledger">
          {courses.map((course) => (
            <Link
              href={`/app/courses/${course.id}`}
              key={course.id}
              className="course-ledger-row"
            >
              <span className={`course-index ${course.color}`}>
                {course.code}
              </span>
              <span>
                <strong>{course.name}</strong>
                <small>{course.instructor}</small>
              </span>
              <span>
                <BookOpen size={15} /> {course.meetings}
              </span>
              <span>
                <CalendarDays size={15} /> {course.next}
              </span>
              <ArrowRight size={17} />
            </Link>
          ))}
        </div>
      </section>
      <section className="overview-section">
        <div className="content-heading">
          <div>
            <p className="eyebrow">Near horizon</p>
            <h2>Next deadlines</h2>
          </div>
          <Link href="/app/assignments">
            All assignments <ArrowRight size={15} />
          </Link>
        </div>
        <div className="deadline-table">
          {assignments.slice(0, 4).map((item) => (
            <div key={item.id}>
              <span className={`deadline-date ${item.urgency}`}>
                {item.due}
              </span>
              <span>
                <strong>{item.title}</strong>
                <small>
                  {item.course} · {item.type}
                </small>
              </span>
              <span className="progress-inline">
                <span style={{ width: `${item.progress}%` }} />
              </span>
              <span>{item.progress}%</span>
            </div>
          ))}
        </div>
      </section>
      <section className="source-note">
        <FileText size={19} />
        <div>
          <strong>Source-aware by design</strong>
          <p>
            Every imported deadline keeps its document, page number, confidence,
            and review decision.
          </p>
        </div>
        <Link href="/app/review/demo">Open latest review</Link>
      </section>
    </div>
  );
}
