import { useEffect, useRef, useState } from "react";
import { ArrowUpRight, LoaderCircle, Search, Sparkles, X } from "lucide-react";
import { searchContent } from "../lib/api";
import type { Content } from "../lib/types";

interface SearchBarProps {
  onResults?: (results: Content[]) => void;
  onSearchStart?: () => void;
  onSearchEnd?: () => void;
  onClear?: () => void;
}
export function SearchBar({
  onResults,
  onSearchStart,
  onSearchEnd,
  onClear,
}: SearchBarProps) {
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [feedback, setFeedback] = useState("");
  const controller = useRef<AbortController | null>(null);
  const requestId = useRef(0);
  useEffect(
    () => () => {
      requestId.current += 1;
      controller.current?.abort();
    },
    [],
  );
  const handleSearch = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!query.trim()) return;
    controller.current?.abort();
    controller.current = new AbortController();
    const current = ++requestId.current;
    setLoading(true);
    setError("");
    setFeedback("");
    onSearchStart?.();
    try {
      const response = await searchContent(
        query.trim(),
        controller.current.signal,
      );
      if (current === requestId.current) {
        onResults?.(response.results || []);
        setFeedback(
          response.semanticAvailable === false
            ? "Smart search is temporarily unavailable. Showing keyword matches."
            : `${response.results.length} ${response.results.length === 1 ? "match" : "matches"} for “${response.query}”${response.results.length === 50 ? " — showing the first 50" : ""}.`,
        );
      }
    } catch {
      if (current === requestId.current)
        setError("We couldn’t search your library. Please try again.");
    } finally {
      if (current === requestId.current) {
        setLoading(false);
        onSearchEnd?.();
      }
    }
  };
  const clear = () => {
    requestId.current += 1;
    controller.current?.abort();
    setFeedback("");
    setQuery("");
    setError("");
    setLoading(false);
    onSearchEnd?.();
    onClear?.();
  };
  return (
    <div className="app-search-wrap">
      <form className="app-search" onSubmit={handleSearch} role="search">
        <Search size={19} strokeWidth={1.6} />
        <input
          aria-label="Search your library"
          maxLength={500}
          placeholder="Find an idea, not just a keyword…"
          value={query}
          onChange={(event) => {
            requestId.current += 1;
            controller.current?.abort();
            setLoading(false);
            setError("");
            setFeedback("");
            onSearchEnd?.();
            setQuery(event.target.value);
            if (!event.target.value) clear();
          }}
        />
        <span className="search-ai">
          <Sparkles size={13} /> Ask your second brain
        </span>
        {query && (
          <button type="button" onClick={clear} aria-label="Clear search">
            <X size={16} />
          </button>
        )}
        <button
          type="submit"
          className="search-submit"
          aria-label="Search"
          disabled={loading || !query.trim()}
        >
          {loading ? (
            <LoaderCircle size={17} className="animate-spin" />
          ) : (
            <ArrowUpRight size={17} />
          )}
        </button>
      </form>
      {feedback && (
        <p className="search-feedback" role="status">
          {feedback}
        </p>
      )}
      {error && (
        <p className="form-error" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}
