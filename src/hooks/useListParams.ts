import { useCallback, useMemo, useRef, useState } from "react";

export interface BaseListParams {
  page?: number;
  limit?: number;
  search?: string;
  dateFrom?: string;
  dateTo?: string;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}

/**
 * Owns the query-string state of a server-paginated list.
 * Every change to a filter, search term, date range or sort resets the page to 1;
 * only `setPage` / `setLimit` keep (or deliberately reset) pagination on their own.
 */
export function useListParams<P extends BaseListParams>(initial: P) {
  const [params, setParams] = useState<P>(initial);
  const initialRef = useRef(initial);

  const setFilter = useCallback(<K extends keyof P>(key: K, value: P[K] | undefined) => {
    setParams((prev) => ({ ...prev, [key]: value, page: 1 }) as P);
  }, []);

  const setSearch = useCallback((search: string) => {
    setParams((prev) => (prev.search === search ? prev : ({ ...prev, search, page: 1 } as P)));
  }, []);

  const setDateRange = useCallback((dateFrom?: string, dateTo?: string) => {
    setParams((prev) => ({ ...prev, dateFrom, dateTo, page: 1 }) as P);
  }, []);

  const setSort = useCallback((value: string) => {
    const [sortBy, sortOrder] = value.split(":");
    setParams((prev) => ({ ...prev, sortBy, sortOrder: sortOrder === "asc" ? "asc" : "desc", page: 1 }) as P);
  }, []);

  const setPage = useCallback((page: number, limit?: number) => {
    setParams((prev) => ({ ...prev, page, ...(limit ? { limit } : {}) }) as P);
  }, []);

  const setLimit = useCallback((limit: number) => {
    setParams((prev) => ({ ...prev, limit, page: 1 }) as P);
  }, []);

  /** After a delete the current page can disappear; step back to the last page that still exists. */
  const clampPage = useCallback((totalPages: number) => {
    setParams((prev) => {
      const page = prev.page ?? 1;
      return page > totalPages ? ({ ...prev, page: Math.max(1, totalPages) } as P) : prev;
    });
  }, []);

  const reset = useCallback(() => setParams((prev) => ({ ...initialRef.current, limit: prev.limit }) as P), []);

  const isDirty = useMemo(() => {
    const strip = (p: P) => {
      const copy = { ...p } as Record<string, unknown>;
      delete copy.page;
      delete copy.limit;
      return JSON.stringify(copy);
    };
    return strip(params) !== strip(initialRef.current);
  }, [params]);

  const sortValue = `${params.sortBy ?? ""}:${params.sortOrder ?? "desc"}`;

  return { params, setFilter, setSearch, setDateRange, setSort, setPage, setLimit, clampPage, reset, isDirty, sortValue };
}
