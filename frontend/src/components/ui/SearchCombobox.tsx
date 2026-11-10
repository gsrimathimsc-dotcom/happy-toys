import { useEffect, useId, useRef, useState, type FormEvent, type KeyboardEvent, type ReactNode } from "react";
import { useLocation } from "react-router-dom";
import { Search } from "lucide-react";
import { cn } from "@/lib/utils";

interface SearchComboboxProps<T> {
  label: string;
  placeholder: string;
  /** What is typed in the box. The parent owns it. */
  value: string;
  onValueChange: (value: string) => void;
  /** Matches to show. `null` means "still searching". */
  suggestions: T[] | null;
  getKey: (item: T) => string;
  renderItem: (item: T) => ReactNode;
  /** Called when the customer picks a match, by click or by Enter on a highlighted one. */
  onSelect: (item: T) => void;
  /** Called on Enter with nothing highlighted, or when the search button is pressed. */
  onSubmit?: (value: string) => void;
  /** The dropdown opens once at least this many letters are typed. */
  minLength?: number;
  emptyText?: (value: string) => string;
  /** A row under the matches, for example "See all 12 results". */
  footer?: (close: () => void) => ReactNode;
  showSubmitButton?: boolean;
  className?: string;
  inputClassName?: string;
}

/**
 * A search box with a dropdown of matches. It works with the mouse and the keyboard:
 * arrow keys move, Enter picks, Escape closes. The parent decides what the matches are,
 * so the same box serves the store (matches from the API) and the admin lists (local matches).
 */
export default function SearchCombobox<T>({
  label,
  placeholder,
  value,
  onValueChange,
  suggestions,
  getKey,
  renderItem,
  onSelect,
  onSubmit,
  minLength = 2,
  emptyText = (term) => `No matches for "${term}".`,
  footer,
  showSubmitButton = false,
  className,
  inputClassName,
}: SearchComboboxProps<T>) {
  const { pathname } = useLocation();
  const listId = useId();
  const boxRef = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(-1);

  const typed = value.trim();
  const showList = open && typed.length >= minLength;
  const items = suggestions ?? [];

  // Close when the customer clicks elsewhere or moves to another page.
  useEffect(() => {
    const closeOutside = (event: MouseEvent) => {
      if (!boxRef.current?.contains(event.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", closeOutside);
    return () => document.removeEventListener("mousedown", closeOutside);
  }, []);
  useEffect(() => setOpen(false), [pathname]);

  // A new list of matches starts with nothing highlighted.
  useEffect(() => setActive(-1), [suggestions]);

  const close = () => setOpen(false);

  const pick = (item: T) => {
    setOpen(false);
    onSelect(item);
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Escape") {
      setOpen(false);
    } else if (event.key === "ArrowDown" && items.length > 0) {
      event.preventDefault();
      setOpen(true);
      setActive((index) => (index + 1) % items.length);
    } else if (event.key === "ArrowUp" && items.length > 0) {
      event.preventDefault();
      setActive((index) => (index <= 0 ? items.length - 1 : index - 1));
    } else if (event.key === "Enter" && showList && active >= 0 && items[active]) {
      event.preventDefault();
      pick(items[active]);
    }
  };

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    setOpen(false);
    onSubmit?.(typed);
  };

  return (
    <div ref={boxRef} className={cn("relative w-full", className)}>
      <form onSubmit={handleSubmit} role="search" className="relative w-full">
        <input
          type="search"
          value={value}
          onChange={(e) => {
            onValueChange(e.target.value);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          aria-label={label}
          aria-autocomplete="list"
          aria-controls={showList ? listId : undefined}
          aria-activedescendant={showList && active >= 0 ? `${listId}-${active}` : undefined}
          autoComplete="off"
          className={cn(showSubmitButton && "pr-12", inputClassName)}
        />
        {showSubmitButton && (
          <button
            type="submit"
            className="absolute right-1.5 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full bg-primary text-white transition hover:bg-primary-dark"
            aria-label="Search"
          >
            <Search className="h-4 w-4" />
          </button>
        )}
      </form>

      {showList && (
        <div className="absolute left-0 top-full z-[70] mt-2 w-full min-w-[16rem] max-w-[calc(100vw-2rem)] animate-drop-in overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-xl">
          {suggestions === null ? (
            <p className="px-4 py-3 text-sm text-muted">Searching...</p>
          ) : items.length === 0 ? (
            <p className="px-4 py-3 text-sm text-muted">{emptyText(typed)}</p>
          ) : (
            <>
              <ul id={listId} role="listbox" aria-label="Search suggestions" className="max-h-[60dvh] divide-y divide-slate-50 overflow-y-auto">
                {items.map((item, index) => (
                  <li
                    key={getKey(item)}
                    id={`${listId}-${index}`}
                    role="option"
                    aria-selected={index === active}
                    // mousedown, so the pick happens before the box loses focus
                    onMouseDown={(event) => {
                      event.preventDefault();
                      pick(item);
                    }}
                    onMouseEnter={() => setActive(index)}
                    className={cn("cursor-pointer px-3 py-2.5 transition", index === active ? "bg-primary-light/60" : "hover:bg-slate-50")}
                  >
                    {renderItem(item)}
                  </li>
                ))}
              </ul>
              {footer?.(close)}
            </>
          )}
        </div>
      )}
    </div>
  );
}
