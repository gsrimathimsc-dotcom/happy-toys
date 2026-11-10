import { Link } from "react-router-dom";
import { Smile } from "lucide-react";

export default function Logo({ light = false }: { light?: boolean }) {
  return (
    <Link to="/" className="flex shrink-0 items-center gap-2" aria-label="Happy Toys home">
      <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary shadow-md shadow-primary/30">
        <Smile className="h-6 w-6 text-secondary" strokeWidth={2.5} />
      </span>
      <span className={`text-lg font-extrabold tracking-tight sm:text-xl ${light ? "text-white" : "text-navy"}`}>
        Happy<span className="text-accent">Toys</span>
      </span>
    </Link>
  );
}
