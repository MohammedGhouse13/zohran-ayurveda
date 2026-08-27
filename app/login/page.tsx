"use client";

import { Suspense, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useSearchParams, useRouter } from "next/navigation";

function LoginForm() {
  const supabase = createClient();
  const router = useRouter();
  const params = useSearchParams();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }

    router.push(params.get("next") || "/admin");
  }

  return (
    <section className="authshell">
      <div className="authcard">
        <div className="kicker">Admin access</div>

        <h1
          style={{
            font: "500 39px Georgia,serif",
            color: "var(--forest)",
          }}
        >
          Sign in to Zohran Ayurveda
        </h1>

        <p className="muted">
          Use the Supabase Auth account created for the store administrator.
        </p>

        <form className="form" onSubmit={submit}>
          <input
            className="input"
            type="email"
            placeholder="Admin email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <input
            className="input"
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          {error && <div className="notice">{error}</div>}

          <button className="btn primary" disabled={loading}>
            {loading ? "Signing in..." : "Sign in"}
          </button>
        </form>
      </div>
    </section>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <section className="authshell">
          <div className="authcard">
            <div className="kicker">Admin access</div>
            <h1
              style={{
                font: "500 39px Georgia,serif",
                color: "var(--forest)",
              }}
            >
              Sign in to Zohran Ayurveda
            </h1>
            <p className="muted">Loading...</p>
          </div>
        </section>
      }
    >
      <LoginForm />
    </Suspense>
  );
}