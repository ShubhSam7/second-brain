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
  const [matchType, setMatchType] = useState<"semantic" | "keyword" | null>(null);
  const [resultCount, setResultCount] = useState<number>(0);

  const handleSearch = async (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && query.trim()) {
      setLoading(true);
      setError(null);
      setMatchType(null);

      if (onSearchStart) {
        onSearchStart();
      }

      try {
        const response = await searchContent(query.trim());
        console.log("🔍 Search Results:", response);

        setMatchType(response.matchType || "semantic");
        setResultCount(response.results?.length || 0);

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
    setMatchType(null);
    setResultCount(0);
    if (onResults) {
      onResults([]);
    }
  };

  return (
    <div className="relative w-full">
      <div className="relative">
        <input
          className="w-full bg-white/95 backdrop-blur-sm border-2 border-gray-200 p-4 pl-12 pr-12 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all text-gray-900 placeholder-gray-400 font-medium shadow-sm"
          placeholder="Ask your second brain... (Press Enter to search)"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={handleSearch}
          disabled={loading}
        />
        
        {/* Search Icon */}
        <svg
          className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400"
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
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
              className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-orange-500 transition-colors p-1 hover:bg-orange-50 rounded-lg"
              aria-label="Clear search"
            >
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
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
        <div className="mt-3 text-sm text-red-500 bg-red-50 p-3 rounded-lg border border-red-200">
          {error}
        </div>
      )}

      {/* Search Hint */}
      {!loading && !error && query && !matchType && (
        <div className="mt-2 text-xs text-gray-500 flex items-center gap-2">
          <span>Press</span>
          <kbd className="px-2 py-1 bg-gray-100 rounded border border-gray-300 font-mono text-xs">
            Enter
          </kbd>
          <span>to search</span>
        </div>
      )}

      {/* Search Results Info */}
      {!loading && matchType && resultCount > 0 && (
        <div className="mt-3 flex items-center gap-2 text-xs">
          <span className="text-gray-600">
            Found {resultCount} result{resultCount !== 1 ? "s" : ""} using{" "}
            <span className={`font-semibold ${matchType === "semantic" ? "text-orange-600" : "text-blue-600"}`}>
              {matchType === "semantic" ? "semantic matching" : "keyword search"}
            </span>
          </span>
        </div>
      )}

      {/* No Results Message */}
      {!loading && matchType && resultCount === 0 && (
        <div className="mt-3 text-sm text-gray-500 bg-gray-50 p-3 rounded-lg border border-gray-200">
          No results found for "{query}". Try different keywords or check your spelling.
        </div>
      )}
    </div>
  );
}
