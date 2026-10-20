import { useEffect } from "react";

/** Sets the browser tab title to "<title> · AdStation". */
export function useDocumentTitle(title: string) {
  useEffect(() => {
    document.title = title ? `${title} · AdStation` : "AdStation";
  }, [title]);
}
