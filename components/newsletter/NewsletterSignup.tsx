"use client";

import { useState } from "react";
import Link from "next/link";

type State = { kind: "idle" } | { kind: "sending" } | { kind: "done" } | { kind: "error"; message: string };

export default function NewsletterSignup({
  source,
  variant = "dark",
}: {
  source: "footer" | "news" | "home";
  variant?: "dark" | "light";
}) {
  const [email, setEmail] = useState("");
  const [company, setCompany] = useState(""); // honeypot — see the API route
  const [consent, setConsent] = useState(false);
  const [state, setState] = useState<State>({ kind: "idle" });

  const dark = variant === "dark";

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (state.kind === "sending") return;
    setState({ kind: "sending" });

    try {
      const res = await fetch("/api/newsletter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, source, company }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setState({ kind: "error", message: data.error ?? "Something went wrong. Please try again." });
        return;
      }
      setState({ kind: "done" });
      setEmail("");
      setConsent(false);
    } catch {
      setState({ kind: "error", message: "Network error. Please try again." });
    }
  }

  if (state.kind === "done") {
    return (
      <p className={`text-sm ${dark ? "text-gray-300" : "text-gray-700"}`}>
        <span style={{ color: "#FFD700" }}>✓</span> You&apos;re subscribed. Look out for the next issue —
        every email has an unsubscribe link.
      </p>
    );
  }

  return (
    <form onSubmit={onSubmit} className="space-y-3">
      <div className="flex flex-col sm:flex-row gap-2">
        <label htmlFor={`newsletter-email-${source}`} className="sr-only">
          Email address
        </label>
        <input
          id={`newsletter-email-${source}`}
          type="email"
          required
          autoComplete="email"
          value={email}
          onChange={e => setEmail(e.target.value)}
          placeholder="you@example.com"
          className={`flex-1 min-w-0 px-3 py-2 rounded-lg text-sm border outline-none focus:ring-2 ${
            dark
              ? "bg-white/10 border-white/15 text-white placeholder-gray-500 focus:ring-yellow-400/40"
              : "bg-white border-gray-200 text-gray-900 placeholder-gray-400 focus:ring-blue-300"
          }`}
        />
        <button
          type="submit"
          disabled={state.kind === "sending" || !consent}
          className="px-4 py-2 rounded-lg text-sm font-semibold transition-opacity hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed shrink-0"
          style={{ backgroundColor: "#FFD700", color: "#003399" }}
        >
          {state.kind === "sending" ? "Subscribing…" : "Subscribe"}
        </button>
      </div>

      {/* Hidden from people, visible to naive bots. Not display:none — some bots skip those. */}
      <div aria-hidden className="absolute w-px h-px overflow-hidden -left-[9999px]">
        <label htmlFor={`newsletter-company-${source}`}>Company</label>
        <input
          id={`newsletter-company-${source}`}
          type="text"
          tabIndex={-1}
          autoComplete="off"
          value={company}
          onChange={e => setCompany(e.target.value)}
        />
      </div>

      <label className={`flex gap-2 items-start text-xs ${dark ? "text-gray-400" : "text-gray-600"}`}>
        <input
          type="checkbox"
          required
          checked={consent}
          onChange={e => setConsent(e.target.checked)}
          className="mt-0.5 shrink-0"
        />
        <span>
          I agree to receive the EU-UA.com newsletter and I can unsubscribe at any time. See the{" "}
          <Link href="/privacy" className="underline underline-offset-2 hover:opacity-80">
            privacy notice
          </Link>
          .
        </span>
      </label>

      {state.kind === "error" && (
        <p className="text-xs" style={{ color: dark ? "#FCA5A5" : "#B91C1C" }} role="alert">
          {state.message}
        </p>
      )}
    </form>
  );
}
