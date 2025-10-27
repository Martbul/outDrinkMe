import { useState, useEffect, useCallback } from "react";

interface UseSearchOptions<T> {
  searchFn: (query: string) => Promise<T[]>;
  debounceMs?: number;
  minQueryLength?: number;
  onError?: (error: unknown) => void;
}

interface UseSearchReturn<T> {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  searchResults: T[];
  setSearchResults: React.Dispatch<React.SetStateAction<T[]>>;
  loading: boolean;
  lastSearchedQuery: string;
  clearSearch: () => void;
}

export function useSearch<T>({
  searchFn,
  debounceMs = 700,
  minQueryLength = 2,
  onError,
}: UseSearchOptions<T>): UseSearchReturn<T> {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<T[]>([]);
  const [loading, setLoading] = useState(false);
  const [lastSearchedQuery, setLastSearchedQuery] = useState("");

  useEffect(() => {
    const timer = setTimeout(async () => {
      const trimmedQuery = searchQuery.trim();

      if (
        trimmedQuery.length >= minQueryLength &&
        trimmedQuery !== lastSearchedQuery
      ) {
        setLoading(true);
        try {
          const results = await searchFn(trimmedQuery);
          setSearchResults(results);
          setLastSearchedQuery(trimmedQuery);
        } catch (error) {
          console.error("Search failed:", error);
          if (onError) {
            onError(error);
          }
        } finally {
          setLoading(false);
        }
      } else if (trimmedQuery.length < minQueryLength) {
        setSearchResults([]);
        setLastSearchedQuery("");
      }
    }, debounceMs);

    return () => clearTimeout(timer);
  }, [
    searchQuery,
    searchFn,
    lastSearchedQuery,
    debounceMs,
    minQueryLength,
    onError,
  ]);

  const clearSearch = useCallback(() => {
    setSearchQuery("");
    setSearchResults([]);
    setLastSearchedQuery("");
  }, []);

  return {
    searchQuery,
    setSearchQuery,
    searchResults,
    setSearchResults,
    loading,
    lastSearchedQuery,
    clearSearch,
  };
}
