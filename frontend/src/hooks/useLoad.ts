import { useCallback, useEffect, useState } from "react";

/**
 * Loads data when a page opens, and again whenever `key` changes.
 * `reload` fetches it again, for example after saving a change.
 */
export function useLoad<T>(load: () => Promise<T>, key: unknown = null) {
  const [data, setData] = useState<T | null>(null);
  const [error, setError] = useState("");
  const [reloadCount, setReloadCount] = useState(0);

  useEffect(() => {
    let cancelled = false;
    setError("");
    load()
      .then((result) => {
        if (!cancelled) setData(result);
      })
      .catch((err: Error) => {
        if (!cancelled) setError(err.message);
      });
    return () => {
      cancelled = true;
    };
    // `load` is usually written inline, so `key` decides when to load again.
  }, [key, reloadCount]);

  const reload = useCallback(() => setReloadCount((count) => count + 1), []);

  return { data, error, reload };
}
