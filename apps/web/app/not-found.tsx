import Link from "next/link";

export default function NotFound() {
  return (
    <main className="centered-state">
      <p className="eyebrow">404 · Not found</p>
      <h1>This page isn’t in the semester.</h1>
      <p>The link may be old, or this item may have been removed.</p>
      <Link className="button" href="/app/today">
        Return to today
      </Link>
    </main>
  );
}
