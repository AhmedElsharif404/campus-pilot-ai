import Link from "next/link";
import {
  ArrowRight,
  BookOpen,
  CalendarClock,
  Mail,
  MapPin,
  UserRound,
} from "lucide-react";
import { courses } from "@/lib/demo-data";
import { notFound } from "next/navigation";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const course = courses.find((item) => item.id === id);
  return { title: course?.name ?? "Course" };
}

export default async function CoursePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const course = courses.find((item) => item.id === id);
  if (!course) notFound();
  return (
    <div className="workspace-page course-page">
      <header className="course-masthead">
        <div>
          <p className="date-line">{course.code} · Fall 2026</p>
          <h1>{course.name}</h1>
          <p>{course.instructor}</p>
        </div>
        <span className={`course-monogram ${course.color}`}>
          {course.code.split(" ")[0]}
        </span>
      </header>
      <section className="course-facts">
        <div>
          <UserRound />
          <span>
            <strong>{course.instructor}</strong>
            <small>
              <Mail /> mchen@northbridge.edu
            </small>
          </span>
        </div>
        <div>
          <CalendarClock />
          <span>
            <strong>{course.meetings}</strong>
            <small>
              <MapPin /> Science Hall 204
            </small>
          </span>
        </div>
        <div>
          <BookOpen />
          <span>
            <strong>Office hours</strong>
            <small>Tue · 2:00–4:00 PM</small>
          </span>
        </div>
      </section>
      <div className="course-layout">
        <section>
          <div className="content-heading">
            <div>
              <p className="eyebrow">Course work</p>
              <h2>Next milestones</h2>
            </div>
            <Link href="/app/assignments">
              All work <ArrowRight size={15} />
            </Link>
          </div>
          <div className="milestone-list">
            <article>
              <span>Sep 18</span>
              <div>
                <strong>Cell membrane lab report</strong>
                <small>12% of final grade · 42% prepared</small>
              </div>
              <span className="status status-review">Due soon</span>
            </article>
            <article>
              <span>Sep 29</span>
              <div>
                <strong>Cell signaling quiz</strong>
                <small>8% of final grade · not started</small>
              </div>
              <span className="status status-neutral">Confirmed</span>
            </article>
            <article>
              <span>Oct 12</span>
              <div>
                <strong>Midterm examination</strong>
                <small>22% of final grade · 4 source readings</small>
              </div>
              <span className="status status-neutral">Confirmed</span>
            </article>
          </div>
        </section>
        <aside className="grading-sheet">
          <p className="eyebrow">Grading weights</p>
          <h2>How the course adds up</h2>
          {[
            ["Labs", 30],
            ["Midterm", 22],
            ["Final", 28],
            ["Quizzes", 10],
            ["Participation", 10],
          ].map(([label, value]) => (
            <div key={String(label)}>
              <span>{label}</span>
              <span className="grading-line" />
              <strong>{value}%</strong>
            </div>
          ))}
          <p className="source-footnote">
            Confirmed from syllabus pages 2–3 on Sep 16.
          </p>
        </aside>
      </div>
    </div>
  );
}
