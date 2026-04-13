export default function Loading() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh]">
      <div
        className="w-10 h-10 border-4 rounded-full animate-spin mb-4"
        style={{ borderColor: "#FFD700", borderTopColor: "#003399" }}
      />
      <p className="text-sm text-gray-500">Loading...</p>
    </div>
  );
}
