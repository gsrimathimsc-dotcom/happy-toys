import { SearchX } from "lucide-react";
import Button from "@/components/ui/Button";
import { useDocumentTitle } from "@/hooks/useDocumentTitle";

export default function NotFoundPage() {
  useDocumentTitle("Page not found");
  return (
    <div className="container-page flex flex-col items-center py-24 text-center">
      <span className="flex h-24 w-24 items-center justify-center rounded-full bg-primary-light">
        <SearchX className="h-12 w-12 text-primary" />
      </span>
      <h1 className="mt-6 text-4xl font-extrabold text-navy">Page not found</h1>
      <p className="mt-2 max-w-md text-muted">
        Oops! The toy or page you are looking for has wandered off. Let&apos;s get you back on track.
      </p>
      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <Button href="/">Go to Home</Button>
        <Button href="/products" variant="outline">
          Browse Toys
        </Button>
      </div>
    </div>
  );
}
