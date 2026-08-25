import Link from "next/link";
import {
  ArrowRight,
  CalendarClock,
  CloudOff,
  TriangleAlert,
} from "lucide-react";
import { TodayAgenda } from "@/components/today-agenda";
import { agenda } from "@/lib/demo-data";

export const metadata = { title: "Today" };

export default function TodayPage() {
  return (
    <div className="workspace-page today-page">
      <header className="workspace-page-header">
        <div>
          <p className="date-line">Wednesday · September 16</p>
          <h1>Good morning, Alex.</h1>
          <p>
            Two focused sessions and one deadline will keep the week on course.
          </p>
        </div>
        <Link
          className="button button-secondary desktop-only"
          href="/app/study-plan"
        >
          <CalendarClock size={17} /> Adjust today
        </Link>
      </header>
      <section className="pressure-note" aria-labelledby="pressure-title">
        <TriangleAlert size={20} />
        <div>
          <h2 id="pressure-title">Friday is carrying too much weight.</h2>
          <p>
            The BIO 214 lab report and STAT 201 problem set land within 24
            hours. Your plan starts both today.
          </p>
        </div>
        <Link href="/app/study-plan">
          See the plan <ArrowRight size={15} />
        </Link>
      </section>
      <div className="today-layout">
        <section aria-labelledby="agenda-heading">
          <div className="content-heading">
            <div>
              <p className="eyebrow">Your day</p>
              <h2 id="agenda-heading">Agenda</h2>
            </div>
            <span>5 items · 2h 50m focused work</span>
          </div>
          <TodayAgenda initialItems={agenda} />
        </section>
        <aside className="today-aside">
          <section className="review-callout">
            <p className="eyebrow">Needs your eye</p>
            <h2>Cell Biology import</h2>
            <p>
              Six details are ready to review. The lowest-confidence field is
              the participation weight.
            </p>
            <div className="review-scale">
              <span style={{ width: "72%" }} />
            </div>
            <Link className="text-link" href="/app/review/demo">
              Review 6 fields <ArrowRight size={15} />
            </Link>
          </section>
          <section className="week-note">
            <span className="week-number">04</span>
            <div>
              <p className="eyebrow">Week of 14–20 Sep</p>
              <h2>Steady, with one tight finish.</h2>
              <p>
                7 of 11 planned sessions completed. You protected 5h 25m of
                study time.
              </p>
            </div>
          </section>
          <p className="sync-note">
            <CloudOff size={14} /> Today’s agenda is saved for offline use.
          </p>
        </aside>
      </div>
    </div>
  );
}
