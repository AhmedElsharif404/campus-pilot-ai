import Link from "next/link";
import {
  ArrowRight,
  BookOpen,
  CalendarDays,
  Check,
  FileCheck2,
  ShieldCheck,
} from "lucide-react";

const workflow = [
  [
    "01",
    "Bring the syllabus",
    "Upload course PDFs without surrendering control of the source.",
  ],
  [
    "02",
    "Check every detail",
    "Review dates, grading weights, and meetings beside their exact page references.",
  ],
  [
    "03",
    "Plan a real week",
    "Balance deadlines with the time you actually have, then adjust the plan yourself.",
  ],
] as const;

export default function LandingPage() {
  return (
    <main id="main-content" className="landing">
      <header className="landing-nav page-width">
        <Link className="wordmark" href="/" aria-label="CampusPilot AI home">
          <span className="wordmark-seal" aria-hidden="true">
            CP
          </span>
          <span>
            CampusPilot <em>AI</em>
          </span>
        </Link>
        <nav aria-label="Primary navigation">
          <Link href="#method">How it works</Link>
          <Link href="#privacy">Privacy</Link>
          <Link className="button button-small" href="/login">
            Sign in
          </Link>
        </nav>
      </header>

      <section className="hero page-width">
        <div className="hero-copy">
          <p className="eyebrow">Academic planning, with receipts</p>
          <h1>Your syllabus already knows the semester. Put it to work.</h1>
          <p className="hero-intro">
            CampusPilot turns scattered course documents into a clear, editable
            academic plan—while showing exactly where every deadline came from.
          </p>
          <div className="hero-actions">
            <Link className="button" href="/onboarding">
              Plan my semester <ArrowRight size={17} />
            </Link>
            <Link className="text-link" href="/app/today">
              Explore the demo
            </Link>
          </div>
          <p className="trust-line">
            <ShieldCheck size={16} /> Nothing becomes part of your plan until
            you approve it.
          </p>
        </div>
        <div className="hero-proof" aria-label="Example extraction review">
          <div className="proof-heading">
            <div>
              <span className="document-kicker">BIO 214 · Syllabus</span>
              <h2>What CampusPilot found</h2>
            </div>
            <span className="status status-review">Review</span>
          </div>
          <div className="proof-row">
            <FileCheck2 size={19} />
            <div>
              <strong>Midterm examination</strong>
              <span>October 12 · 9:30 AM</span>
            </div>
            <span className="confidence">98%</span>
          </div>
          <blockquote>
            “Midterm Exam — Monday, October 12 during regular class hours.”{" "}
            <cite>Page 4</cite>
          </blockquote>
          <div className="proof-row">
            <BookOpen size={19} />
            <div>
              <strong>Reading: Cell signaling</strong>
              <span>Complete before week 7</span>
            </div>
            <span className="confidence confidence-medium">84%</span>
          </div>
          <div className="proof-actions">
            <button className="button button-secondary">
              <Check size={16} /> Approve selected
            </button>
            <button className="button-quiet">Edit details</button>
          </div>
        </div>
      </section>

      <section id="method" className="method-section">
        <div className="page-width">
          <div className="section-heading">
            <p className="eyebrow">A careful workflow</p>
            <h2>From document to doable week.</h2>
          </div>
          <div className="workflow-list">
            {workflow.map(([number, title, copy]) => (
              <article key={number}>
                <span>{number}</span>
                <div>
                  <h3>{title}</h3>
                  <p>{copy}</p>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section id="privacy" className="privacy-section page-width">
        <div>
          <p className="eyebrow">Built for student trust</p>
          <h2>Suggestions stay suggestions.</h2>
        </div>
        <div className="privacy-copy">
          <p>
            The AI can surface a conflict, sketch a study session, or flag a
            suspicious date. It cannot quietly rewrite confirmed academic
            events.
          </p>
          <ul>
            <li>
              <Check size={16} /> Page-level source references
            </li>
            <li>
              <Check size={16} /> Human approval before persistence
            </li>
            <li>
              <Check size={16} /> Offline agenda access
            </li>
          </ul>
        </div>
      </section>

      <footer className="landing-footer page-width">
        <span>CampusPilot AI</span>
        <span>A portfolio-grade open-source project.</span>
        <CalendarDays size={18} />
      </footer>
    </main>
  );
}
