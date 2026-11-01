import { useEffect, useState } from "react";
import { getCategories } from "@/services/productService";
import type { Category } from "@/types";

// The navbar, footer and pages all need categories, so one request is shared.
let categoriesRequest: Promise<Category[]> | null = null;

export function useCategories(): Category[] {
  const [categories, setCategories] = useState<Category[]>([]);

  useEffect(() => {
    let cancelled = false;
    categoriesRequest ??= getCategories();
    categoriesRequest
      .then((data) => {
        if (!cancelled) setCategories(data);
      })
      .catch(() => {
        // Forget the failure so the next page can try again.
        categoriesRequest = null;
      });
    return () => {
      cancelled = true;
    };
  }, []);

  return categories;
}
