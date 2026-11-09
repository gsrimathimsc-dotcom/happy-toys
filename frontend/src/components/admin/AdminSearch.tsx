import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

interface AdminSearchProps {
  /** Called with the typed text once the typing has paused. */
  onSearch: (term: string) => void;
  label: string;
  placeholder: string;
  className?: string;
  delay?: number;
}

/** The search box shared by the admin lists. It waits for a pause in typing before filtering. */
export default function AdminSearch({ onSearch, label, placeholder, className, delay = 300 }: AdminSearchProps) {
  const [text, setText] = useState("");

  useEffect(() => {
    const timer = setTimeout(() => onSearch(text), delay);
    return () => clearTimeout(timer);
    // `onSearch` is a state setter in every page, so only the typed text matters.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [text, delay]);

  return (
    <input
      type="search"
      value={text}
      onChange={(e) => setText(e.target.value)}
      placeholder={placeholder}
      aria-label={label}
      className={cn("input-field", className)}
    />
  );
}
