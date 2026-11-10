import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";

interface SectionHeadingProps {
  title: string;
  subtitle?: string;
  linkLabel?: string;
  linkHref?: string;
}

export default function SectionHeading({ title, subtitle, linkLabel, linkHref }: SectionHeadingProps) {
  return (
    <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
      <div>
        <h2 className="text-2xl font-extrabold tracking-tight text-navy sm:text-3xl">{title}</h2>
        {subtitle && <p className="mt-1.5 text-muted">{subtitle}</p>}
      </div>
      {linkLabel && linkHref && (
        <Link
          to={linkHref}
          className="group inline-flex min-h-10 items-center gap-1 text-sm font-semibold text-primary hover:text-primary-dark"
        >
          {linkLabel}
          <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
        </Link>
      )}
    </div>
  );
}
