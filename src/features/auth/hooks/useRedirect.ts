import { useMemo } from "react";
import { useLocation } from "react-router-dom";

export function useRedirect(fallback = "/dashboard") {
  const { search } = useLocation();

  return useMemo(() => {
    const redirect = new URLSearchParams(search).get("redirect");
    return redirect?.startsWith("/") ? redirect : fallback;
  }, [search, fallback]);
}