import { useState } from "react";
import { useDebouncedValue } from "./useDebouncedValue";

const MIN_SEARCH_LENGTH = 3;

/**
 * Search text plus a page number that falls back to 1 whenever the (debounced) search
 * or the extra filters described by `filterKey` change.
 */
export function useSearchPagination(filterKey = "") {
  const [query, setQuery] = useState("");
  const liveQuery = query.trim();
  const typedQuery = useDebouncedValue(liveQuery);
  const isTooShort = liveQuery.length > 0 && liveQuery.length < MIN_SEARCH_LENGTH;
  // Below the minimum, drop back to the unfiltered list immediately (including while backspacing).
  // At the minimum, search right away; extra characters stay debounced.
  const debouncedQuery =
    liveQuery.length < MIN_SEARCH_LENGTH ? "" : typedQuery.length >= MIN_SEARCH_LENGTH ? typedQuery : liveQuery;
  const searchError = isTooShort ? `حداقل ${MIN_SEARCH_LENGTH} کاراکتر وارد کنید` : null;
  const listKey = `${debouncedQuery}|${filterKey}`;
  const [pageState, setPageState] = useState({ listKey: "", page: 1 });

  const page = pageState.listKey === listKey ? pageState.page : 1;
  const setPage = (nextPage: number) => setPageState({ listKey, page: nextPage });

  return { query, setQuery, debouncedQuery, searchError, page, setPage };
}
