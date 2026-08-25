import Link from "next/link";
import { AuthForm } from "@/components/auth-form";

export const metadata = { title: "Sign in" };

export default function LoginPage() {
  return (
    <main id="main-content" className="auth-page">
      <section className="auth-brand">
        <Link className="wordmark" href="/">
          <span className="wordmark-seal">CP</span>
          <span>
            CampusPilot <em>AI</em>
          </span>
        </Link>
        <div>
          <p className="eyebrow">Return to your semester</p>
          <h1>Pick up where the work actually is.</h1>
          <blockquote>
            “Friday is carrying too much weight. Your plan starts both
            assignments today.”
          </blockquote>
        </div>
        <p>Private by default · Human-confirmed academic records</p>
      </section>
      <section className="auth-panel">
        <div>
          <p className="eyebrow">Welcome back</p>
          <h2>Sign in</h2>
          <p>
            Use the seeded demo credentials or enter the workspace directly.
          </p>
          <AuthForm />
          <p className="auth-footnote">
            New to CampusPilot?{" "}
            <Link href="/onboarding">Create a semester</Link>
          </p>
        </div>
      </section>
    </main>
  );
}
