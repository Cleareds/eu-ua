"use client";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] px-4 text-center">
      <div
        className="w-16 h-16 rounded-full flex items-center justify-center mb-6"
        style={{ backgroundColor: "#003399" }}
      >
        <span className="text-2xl font-bold" style={{ color: "#FFD700" }}>!</span>
      </div>
      <h2 className="text-xl font-bold mb-2" style={{ color: "#1A1A2E" }}>
        Something went wrong
      </h2>
      <p className="text-sm text-gray-500 mb-6 max-w-md">
        An unexpected error occurred. Please try again or return to the home page.
      </p>
      <div className="flex gap-3">
        <button
          onClick={reset}
          className="px-5 py-2.5 rounded-lg text-sm font-semibold text-white transition-colors hover:opacity-90"
          style={{ backgroundColor: "#003399" }}
        >
          Try Again
        </button>
        <a
          href="/"
          className="px-5 py-2.5 rounded-lg text-sm font-semibold border transition-colors hover:bg-gray-50"
          style={{ borderColor: "#003399", color: "#003399" }}
        >
          Go Home
        </a>
      </div>
    </div>
  );
}
