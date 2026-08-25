import Link from "next/link";
import { OnboardingForm } from "@/components/onboarding-form";

export const metadata = { title: "Create semester" };

export default function OnboardingPage() {
  return (
    <main id="main-content" className="onboarding-page">
      <header>
        <Link className="wordmark" href="/">
          <span className="wordmark-seal">CP</span>
          <span>
            CampusPilot <em>AI</em>
          </span>
        </Link>
        <Link href="/login">Already have an account? Sign in</Link>
      </header>
      <OnboardingForm />
    </main>
  );
}
