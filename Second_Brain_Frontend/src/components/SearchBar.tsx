import { useState } from "react";
import { searchContent } from "../lib/api";
import { LoaderIcon } from "../icons/LoaderIcon";

interface SearchBarProps {
  onResults?: (results: any[]) => void;
  onSearchStart?: () => void;
  onSearchEnd?: () => void;
}

export function SearchBar({
  onResults,
  onSearchStart,
  onSearchEnd,
}: SearchBarProps) {
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSearch = async (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && query.trim()) {
      setLoading(true);
      setError(null);

      if (onSearchStart) {
        onSearchStart();
      }

      try {
        const response = await searchContent(query.trim());
        console.log("🔍 Search Results:", response);

        if (onResults) {
          onResults(response.results || []);
        }
      } catch (err: any) {
        const errorMessage =
          err.response?.data?.message || err.message || "Search failed";
        setError(errorMessage);
        console.error("❌ Search Error:", errorMessage);
      } finally {
        setLoading(false);
        if (onSearchEnd) {
          onSearchEnd();
        }
      }
    }
  };

  const handleClear = () => {
    setQuery("");
    setError(null);
    if (onResults) {
      onResults([]);
    }
  };

  return (
    <div className="relative w-full">
      <div className="relative">
        <input
          className="w-full bg-surface-light border border-border-muted p-3 pl-10 pr-10 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent-primary focus:border-transparent transition-all text-text-primary placeholder-text-secondary"
          placeholder="🧠 Ask your second brain... (Press Enter to search)"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={handleSearch}
          disabled={loading}
        />

        {/* Search Icon */}
        <svg
          className="absolute left-3 top-1/2 transform -translate-y-1/2 text-text-secondary"
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <circle cx="11" cy="11" r="8" />
          <path d="m21 21-4.35-4.35" />
        </svg>

        {/* Loading or Clear Button */}
        {loading ? (
          <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
            <LoaderIcon />
          </div>
        ) : (
          query && (
            <button
              onClick={handleClear}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-text-secondary hover:text-accent-primary transition-colors"
              aria-label="Clear search"
            >
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          )
        )}
      </div>

      {/* Error Message */}
      {error && (
        <div className="mt-2 text-sm text-red-400 bg-red-400/10 p-2 rounded">
          {error}
        </div>
      )}

      {/* Search Hint */}
      {!loading && !error && query && (
        <div className="mt-2 text-xs text-text-secondary">
          Press{" "}
          <kbd className="px-2 py-1 bg-surface-light rounded border border-border-muted">
            Enter
          </kbd>{" "}
          to search
        </div>
      )}
    </div>
  );
}
