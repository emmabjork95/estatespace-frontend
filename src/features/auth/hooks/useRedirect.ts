import { useMemo } from "react";
import { useLocation } from "react-router-dom";

export function useRedirect(fallback: string = "/dashboard") {
  const location = useLocation();

  return useMemo(() => {
    const params = new URLSearchParams(location.search);
    const r = params.get("redirect");

    if (r && r.startsWith("/")) return r;

    return fallback;
  }, [location.search, fallback]);
}
