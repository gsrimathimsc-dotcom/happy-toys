import { useRouteError } from "react-router-dom";
import { CircleAlert } from "lucide-react";
import Button from "@/components/ui/Button";

// Shown by the router if a page crashes while rendering.
export default function ErrorPage() {
  const error = useRouteError();
  const message = error instanceof Error ? error.message : "An unexpected error occurred.";

  return (
    <div className="container-page flex min-h-screen flex-col items-center justify-center text-center">
      <CircleAlert className="h-14 w-14 text-red-500" />
      <h1 className="mt-5 text-3xl font-extrabold text-navy">Something went wrong</h1>
      <p className="mt-2 max-w-md text-muted">{message}</p>
      <div className="mt-8 flex gap-3">
        <Button onClick={() => window.location.reload()}>Try again</Button>
        <Button href="/" variant="outline">
          Go to Home
        </Button>
      </div>
    </div>
  );
}
