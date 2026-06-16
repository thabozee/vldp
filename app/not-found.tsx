import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-zinc-50 px-4 text-center">
      <div
        className="w-16 h-16 rounded-full flex items-center justify-center text-white text-2xl font-bold mb-6"
        style={{ backgroundColor: "#E60000" }}
      >
        404
      </div>
      <h1 className="text-2xl font-bold text-zinc-900 mb-2">Page Not Found</h1>
      <p className="text-zinc-500 mb-6 max-w-sm">
        The page you're looking for doesn't exist or has been moved.
      </p>
      <Link
        href="/"
        className="inline-flex items-center justify-center rounded-lg px-5 py-2.5 text-sm font-semibold text-white transition-opacity hover:opacity-90"
        style={{ backgroundColor: "#E60000" }}
      >
        Back to Home
      </Link>
    </div>
  );
}
