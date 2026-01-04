# SearchBar Component Usage Guide

## Installation Complete! ✅

The SearchBar component has been created and integrated with your AI-powered semantic search backend.

## How to Use

### 1. Import the SearchBar

```tsx
import { SearchBar } from "../components/SearchBar";
```

### 2. Add to Your Dashboard/Page

```tsx
export function Dashboard() {
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);

  return (
    <div>
      <SearchBar
        onResults={(results) => {
          setSearchResults(results);
          setIsSearching(false);
        }}
        onSearchStart={() => setIsSearching(true)}
        onSearchEnd={() => setIsSearching(false)}
      />

      {/* Display search results */}
      {isSearching && <div>Searching...</div>}

      {searchResults.length > 0 && (
        <div className="mt-4">
          <h3 className="text-lg font-bold mb-2">
            Found {searchResults.length} results
          </h3>
          {searchResults.map((item) => (
            <div key={item.id} className="p-4 border rounded mb-2">
              <h4 className="font-semibold">{item.title}</h4>
              <p className="text-sm text-gray-600">{item.description}</p>
              <div className="text-xs text-green-600 mt-1">
                Similarity: {(item.similarity * 100).toFixed(0)}%
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
```

## Features

✅ **Real-time Search** - Press Enter to search
✅ **Loading State** - Shows spinner while searching
✅ **Clear Button** - Click X to clear search
✅ **Error Handling** - Displays errors if search fails
✅ **Semantic Results** - AI-powered similarity matching
✅ **Similarity Scores** - Shows how relevant each result is

## API Integration

The SearchBar uses:

- `searchContent(query)` from `lib/api.ts`
- Calls `GET /api/v1/brain/search?q={query}`
- Returns results with similarity scores (0.0 - 1.0)

## Restart Dev Server

If you see TypeScript errors about `searchContent` not being exported:

```bash
cd Second_Brain_Frontend
npm run dev
```

The TypeScript server should pick up the new export after restart.

## Customization

The SearchBar accepts these optional props:

- `onResults`: Callback with search results
- `onSearchStart`: Called when search begins
- `onSearchEnd`: Called when search completes

Customize the styling by modifying the Tailwind classes in SearchBar.tsx
