import Link from "next/link";

export default function OfflinePage() {
  return (
    <main id="main-content" className="centered-state">
      <p className="eyebrow">Offline mode</p>
      <h1>Your saved agenda is still available.</h1>
      <p>Reconnect to upload documents or sync recent changes.</p>
      <Link className="button" href="/app/today">
        Open saved agenda
      </Link>
    </main>
  );
}
