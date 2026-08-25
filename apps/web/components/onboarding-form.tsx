"use client";

import { ArrowRight, Check } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

export function OnboardingForm() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  return (
    <div className="onboarding-form">
      <div className="onboarding-progress" aria-label={`Step ${step} of 2`}>
        <span className="active">
          <Check size={13} /> Semester
        </span>
        <i />
        <span className={step === 2 ? "active" : ""}>2 Availability</span>
      </div>
      {step === 1 ? (
        <form
          onSubmit={(event) => {
            event.preventDefault();
            setStep(2);
          }}
        >
          <p className="eyebrow">Step 1 of 2</p>
          <h1>Set the academic frame.</h1>
          <p>
            Dates help CampusPilot separate current deadlines from historical or
            example dates inside syllabi.
          </p>
          <div className="form-grid">
            <label>
              Semester name
              <input defaultValue="Fall 2026" required />
            </label>
            <label>
              Institution
              <input defaultValue="Northbridge University" required />
            </label>
            <label>
              First day
              <input type="date" defaultValue="2026-08-31" required />
            </label>
            <label>
              Last day
              <input type="date" defaultValue="2026-12-18" required />
            </label>
          </div>
          <button className="button">
            Continue <ArrowRight size={16} />
          </button>
        </form>
      ) : (
        <form
          onSubmit={(event) => {
            event.preventDefault();
            router.push("/app/upload");
          }}
        >
          <p className="eyebrow">Step 2 of 2</p>
          <h1>Protect time you can keep.</h1>
          <p>
            Set a realistic ceiling. You can refine individual days after
            importing your courses.
          </p>
          <div className="form-grid">
            <label>
              Weekday study start
              <input type="time" defaultValue="09:00" required />
            </label>
            <label>
              Latest study end
              <input type="time" defaultValue="19:00" required />
            </label>
            <label>
              Preferred session
              <select defaultValue="45">
                <option value="25">25 minutes</option>
                <option value="45">45 minutes</option>
                <option value="60">60 minutes</option>
              </select>
            </label>
            <label>
              Weekly study target
              <input type="number" defaultValue="12" min="1" max="60" />
            </label>
          </div>
          <div className="form-actions">
            <button
              type="button"
              className="button button-secondary"
              onClick={() => setStep(1)}
            >
              Back
            </button>
            <button className="button">
              Create semester <ArrowRight size={16} />
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
