import { useEffect, useState, type ReactNode } from "react";
import { useDebouncedValue } from "@/hooks/useDebouncedValue";
import SearchCombobox from "@/components/ui/SearchCombobox";

const MAX_SUGGESTIONS = 6;

interface AdminSearchProps<T> {
  /** Called with the typed text once the typing has paused. The list below the box filters by it. */
  onSearch: (term: string) => void;
  label: string;
  placeholder: string;
  className?: string;
  delay?: number;
  /** Everything that can be searched. The dropdown shows the first few that match. */
  items: T[];
  /** Does this item match the typed text? */
  matches: (item: T, term: string) => boolean;
  getKey: (item: T) => string;
  renderItem: (item: T) => ReactNode;
  /** Picking a match. The box shows `getText(item)` and the list filters by it. */
  onSelect?: (item: T) => void;
  getText?: (item: T) => string;
}

/**
 * The search box shared by the admin lists. It filters the list after a pause in typing,
 * and its dropdown lets you jump straight to one match.
 */
export default function AdminSearch<T>({
  onSearch,
  label,
  placeholder,
  className,
  delay = 300,
  items,
  matches,
  getKey,
  renderItem,
  onSelect,
  getText,
}: AdminSearchProps<T>) {
  const [text, setText] = useState("");
  const debounced = useDebouncedValue(text, delay);

  useEffect(() => {
    onSearch(debounced);
    // `onSearch` is a state setter in every page, so only the typed text matters.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debounced]);

  const term = debounced.trim().toLowerCase();
  // While the customer is still typing, the matches belong to an older word: show "Searching...".
  const suggestions =
    text.trim().toLowerCase() === term ? items.filter((item) => matches(item, term)).slice(0, MAX_SUGGESTIONS) : null;

  const handleSelect = (item: T) => {
    if (getText) {
      const chosen = getText(item);
      setText(chosen);
      onSearch(chosen);
    }
    onSelect?.(item);
  };

  return (
    <SearchCombobox<T>
      label={label}
      placeholder={placeholder}
      value={text}
      onValueChange={setText}
      suggestions={suggestions}
      getKey={getKey}
      renderItem={renderItem}
      onSelect={handleSelect}
      minLength={1}
      className={className}
      inputClassName="input-field"
    />
  );
}
