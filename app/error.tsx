"use client";

import { useEffect } from "react";
import Link from "next/link";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-zinc-50 px-4 text-center">
      <h1 className="text-2xl font-bold text-zinc-900 mb-2">
        Something went wrong
      </h1>
      <p className="text-zinc-500 mb-6 max-w-sm">
        An unexpected error occurred. Please try again or return to the home
        page.
      </p>
      <div className="flex gap-3">
        <button
          onClick={reset}
          className="inline-flex items-center justify-center rounded-lg px-5 py-2.5 text-sm font-semibold text-white bg-zinc-900 hover:bg-zinc-700 transition-colors"
        >
          Try Again
        </button>
        <Link
          href="/"
          className="inline-flex items-center justify-center rounded-lg px-5 py-2.5 text-sm font-semibold border border-zinc-200 text-zinc-700 hover:bg-zinc-50 transition-colors"
        >
          Go Home
        </Link>
      </div>
    </div>
  );
}
