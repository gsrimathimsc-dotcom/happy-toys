import { useEffect } from "react";

const SITE_TITLE = "Happy Toys - Online Toy Store";

/** Sets the browser tab title for a page. */
export function useDocumentTitle(title?: string) {
  useEffect(() => {
    document.title = title ? `${title} | Happy Toys` : SITE_TITLE;
  }, [title]);
}
