import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] px-4 text-center">
      <div
        className="w-16 h-16 rounded-full flex items-center justify-center mb-6"
        style={{ backgroundColor: "#FFD700" }}
      >
        <span className="text-2xl font-bold" style={{ color: "#003399" }}>404</span>
      </div>
      <h2 className="text-xl font-bold mb-2" style={{ color: "#1A1A2E" }}>
        Page not found
      </h2>
      <p className="text-sm text-gray-500 mb-6 max-w-md">
        The page you&apos;re looking for doesn&apos;t exist or has been moved.
      </p>
      <Link
        href="/"
        className="px-5 py-2.5 rounded-lg text-sm font-semibold text-white transition-colors hover:opacity-90"
        style={{ backgroundColor: "#003399" }}
      >
        Back to Home
      </Link>
    </div>
  );
}
