"use client";

import { useState } from "react";

export default function DisclaimerBanner() {
  const [dismissed, setDismissed] = useState(false);
  if (dismissed) return null;

  return (
    <div className="w-full px-4 py-2.5 text-xs text-center flex items-center justify-center gap-3 flex-wrap" style={{ backgroundColor: "#F0F4FF", borderBottom: "1px solid #DBEAFE", color: "#374151" }}>
      <span>
        <span className="font-semibold">Independent initiative</span> — not affiliated with any government or EU institution.
        All data aggregated from public sources: <span className="font-medium">Eurostat, European Commission, EEAS, Kyiv Independent, UN.</span>
      </span>
      <button
        onClick={() => setDismissed(true)}
        className="shrink-0 text-gray-400 hover:text-gray-600 transition-colors font-bold"
        aria-label="Dismiss"
      >
        ✕
      </button>
    </div>
  );
}
