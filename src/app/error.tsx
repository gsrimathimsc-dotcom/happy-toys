"use client";

import { CircleAlert } from "lucide-react";
import Button from "@/components/ui/Button";

// Shown automatically by Next.js if a page crashes while rendering.
export default function ErrorPage({ error, reset }: { error: Error; reset: () => void }) {
  return (
    <div className="container-page flex flex-col items-center py-24 text-center">
      <CircleAlert className="h-14 w-14 text-red-500" />
      <h1 className="mt-5 text-3xl font-extrabold text-navy">Something went wrong</h1>
      <p className="mt-2 max-w-md text-muted">{error.message || "An unexpected error occurred."}</p>
      <div className="mt-8 flex gap-3">
        <Button onClick={reset}>Try again</Button>
        <Button href="/" variant="outline">
          Go to Home
        </Button>
      </div>
    </div>
  );
}
