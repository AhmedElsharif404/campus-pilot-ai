"use client";

import { LoaderCircle } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

export function AuthForm() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError("");
    const data = new FormData(event.currentTarget);
    try {
      const response = await fetch("/api/v1/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: data.get("email"),
          password: data.get("password"),
        }),
      });
      if (!response.ok)
        throw new Error("The email or password was not recognized.");
      router.push("/app/today");
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Sign in failed.");
    } finally {
      setLoading(false);
    }
  }
  return (
    <form className="auth-form" onSubmit={(event) => void submit(event)}>
      <label>
        Email address
        <input
          name="email"
          type="email"
          autoComplete="email"
          defaultValue="alex@northbridge.edu"
          required
        />
      </label>
      <label>
        Password
        <input
          name="password"
          type="password"
          autoComplete="current-password"
          defaultValue="CampusPilotDemo!2026"
          required
        />
      </label>
      {error && (
        <div className="form-error" role="alert">
          {error}
        </div>
      )}
      <button className="button" disabled={loading}>
        {loading ? (
          <>
            <LoaderCircle className="spin" size={16} /> Signing in…
          </>
        ) : (
          "Sign in"
        )}
      </button>
      <button
        type="button"
        className="button button-secondary"
        onClick={() => router.push("/app/today")}
      >
        Enter demo workspace
      </button>
    </form>
  );
}
