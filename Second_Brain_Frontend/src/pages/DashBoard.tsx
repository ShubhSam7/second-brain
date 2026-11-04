import { useMemo, useState } from "react";
import {
  ArrowLeft,
  BookOpen,
  Check,
  ChevronRight,
  LayoutGrid,
  List,
  LoaderCircle,
  Menu,
  Plus,
  RefreshCw,
  Share2,
  Sparkles,
  X,
} from "lucide-react";
import Card from "../components/Card";
import CreateContentModel from "../components/CreateContentModel";
import SideBar from "../components/SideBar";
import { SearchBar } from "../components/SearchBar";
import { useContent } from "../hooks/useContent";
import { createShareLink, getCurrentUser, removeShareLink } from "../lib/api";
import type { CategoryType, Content, ContentType } from "../lib/types";

export default function DashBoard() {
  const [modelOpen, setModelOpen] = useState(false);
  const [activeFilter, setActiveFilter] = useState<
    ContentType | CategoryType | "all"
  >("all");
  const [shareLink, setShareLink] = useState<string | null>(null);
  const [isSharing, setIsSharing] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [searchResults, setSearchResults] = useState<Content[] | null>(null);
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchVersion, setSearchVersion] = useState(0);
  const resetSearch = () => {
    setSearchResults(null);
    setSearchLoading(false);
    setSearchVersion((version) => version + 1);
  };
  const [notice, setNotice] = useState("");
  const [layout, setLayout] = useState<"grid" | "list">("grid");
  const [sort, setSort] = useState("recent");
  const filter =
    activeFilter === "all"
      ? undefined
      : activeFilter === "article"
        ? { category: "article" as CategoryType }
        : { type: activeFilter as ContentType };
  const { content, loading, error, fetchContent, removeContent } =
    useContent(filter);
  const displayed = useMemo(
    () =>
      [...(searchResults ?? content)].sort((a, b) =>
        sort === "title"
          ? a.title.localeCompare(b.title)
          : sort === "oldest"
            ? Date.parse(a.createdAt) - Date.parse(b.createdAt)
            : Date.parse(b.createdAt) - Date.parse(a.createdAt),
      ),
    [content, searchResults, sort],
  );
  const titles: Record<string, string> = {
    all: "All content",
    article: "Articles",
    youtube: "YouTube",
    spotify: "Spotify",
    twitter: "Twitter",
    instagram: "Instagram",
    linkedin: "LinkedIn",
    github: "GitHub",
    other: "Other links",
  };
  const title =
    searchResults !== null
      ? "Search results"
      : titles[activeFilter] || activeFilter;
  const handleShare = async () => {
    setIsSharing(true);
    setNotice("");
    try {
      if (shareLink) {
        await removeShareLink();
        setShareLink(null);
        setNotice("Your share link has been removed.");
      } else {
        const response = await createShareLink();
        const link = `${window.location.origin}/brain/${response.hash}`;
        setShareLink(link);
        try {
          await navigator.clipboard.writeText(link);
          setNotice("Your library link is ready and copied to your clipboard.");
        } catch {
          setNotice(
            "Your library link is ready. Copy it using the field below.",
          );
        }
      }
    } catch {
      setNotice("We couldn’t update your share link. Please try again.");
    } finally {
      setIsSharing(false);
    }
  };
  const handleDelete = async (id: string) => {
    await removeContent(id);
    setSearchResults(
      (previous) => previous?.filter((item) => item.id !== id) ?? null,
    );
  };
  return (
    <div className="dashboard-page">
      {sidebarOpen && (
        <button
          className="sidebar-backdrop"
          aria-label="Close navigation"
          onClick={() => setSidebarOpen(false)}
        />
      )}
      <SideBar
        activeFilter={activeFilter}
        onFilterChange={(value) => {
          setActiveFilter(value);
          setSearchResults(null);
          setSearchLoading(false);
        }}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />
      <main className="app-main">
        <header className="app-topbar">
          <div>
            <button
              className="sidebar-toggle"
              aria-label="Open navigation"
              onClick={() => setSidebarOpen(true)}
            >
              <Menu size={20} />
            </button>
            <span>My workspace</span>
            <ChevronRight size={13} />
            <strong>{title}</strong>
          </div>
          <span className="app-topbar-note">
            <span className="status-dot" /> A little space for your big ideas
          </span>
        </header>
        <div className="dashboard-content">
          <div className="dashboard-heading">
            <div>
              <span className="eyebrow">
                YOUR PERSONAL CORNER OF THE INTERNET
              </span>
              <h1>
                {activeFilter === "all" && searchResults === null ? (
                  <>
                    A little more connected<span>.</span>
                  </>
                ) : (
                  title
                )}
              </h1>
              <p>
                {activeFilter === "all"
                  ? `Welcome back${getCurrentUser() ? `, ${getCurrentUser()}` : ""}. Make room for what inspires you.`
                  : "The things that caught your eye. All in one place."}
              </p>
            </div>
            <div className="dashboard-actions">
              <button
                className="app-secondary"
                onClick={handleShare}
                disabled={isSharing}
              >
                {isSharing ? (
                  <LoaderCircle size={16} className="animate-spin" />
                ) : (
                  <Share2 size={16} />
                )}
                {shareLink ? "Stop sharing" : "Share brain"}
              </button>
              <button
                className="action-primary"
                onClick={() => setModelOpen(true)}
              >
                <Plus size={17} /> Add content
              </button>
            </div>
          </div>
          {notice && (
            <div className="app-notice" role="status">
              <Check size={16} />
              <span>{notice}</span>
              <button
                aria-label="Dismiss message"
                onClick={() => setNotice("")}
              >
                <X size={15} />
              </button>
            </div>
          )}
          {shareLink && (
            <div className="share-link-field">
              <label htmlFor="share-link">Public library link</label>
              <input
                id="share-link"
                readOnly
                value={shareLink}
                onFocus={(event) => event.target.select()}
              />
            </div>
          )}
          <SearchBar
            key={`${activeFilter}-${searchVersion}`}
            onResults={setSearchResults}
            onClear={() => setSearchResults(null)}
            onSearchStart={() => setSearchLoading(true)}
            onSearchEnd={() => setSearchLoading(false)}
          />
          <div className="library-toolbar">
            <div>
              <h2>{title}</h2>
              <span className="content-count">{displayed.length}</span>
              {searchResults !== null && (
                <button className="clear-results" onClick={resetSearch}>
                  <ArrowLeft size={13} /> All content
                </button>
              )}
            </div>
            <div className="library-controls">
              <label className="sort-label">
                <span className="sr-only">Sort content</span>
                <select
                  value={sort}
                  onChange={(event) => setSort(event.target.value)}
                >
                  <option value="recent">Recently added</option>
                  <option value="oldest">Oldest first</option>
                  <option value="title">Title A–Z</option>
                </select>
              </label>
              <div className="layout-switch">
                <button
                  aria-label="Grid view"
                  aria-pressed={layout === "grid"}
                  className={layout === "grid" ? "active" : ""}
                  onClick={() => setLayout("grid")}
                >
                  <LayoutGrid size={16} />
                </button>
                <button
                  aria-label="List view"
                  aria-pressed={layout === "list"}
                  className={layout === "list" ? "active" : ""}
                  onClick={() => setLayout("list")}
                >
                  <List size={17} />
                </button>
              </div>
            </div>
          </div>
          {loading || searchLoading ? (
            <div className="content-state" role="status">
              <LoaderCircle size={27} className="animate-spin" />
              <h3>Making room for your ideas…</h3>
              <p>Your library will be here in a moment.</p>
            </div>
          ) : error && searchResults === null ? (
            <div className="content-state" role="alert">
              <RefreshCw size={26} />
              <h3>Your library couldn’t load.</h3>
              <p>{error}. Let’s give that another try.</p>
              <button className="app-secondary" onClick={fetchContent}>
                <RefreshCw size={15} /> Try again
              </button>
            </div>
          ) : displayed.length === 0 ? (
            <div className="content-state">
              <span className="empty-state-icon">
                <BookOpen size={29} strokeWidth={1.3} />
              </span>
              <span className="eyebrow">
                A LITTLE SPACE. ENDLESS POSSIBILITIES.
              </span>
              <h3>
                {searchResults !== null
                  ? "That idea is still out there."
                  : "Good ideas start somewhere."}
              </h3>
              <p>
                {searchResults !== null
                  ? "Try a different phrase or explore your library."
                  : "Save your first link. An article, a video, anything that sparks a little curiosity."}
              </p>
              <button
                className="action-primary"
                onClick={() =>
                  searchResults !== null ? resetSearch() : setModelOpen(true)
                }
              >
                {searchResults !== null ? (
                  <ArrowLeft size={16} />
                ) : (
                  <Plus size={16} />
                )}
                {searchResults !== null
                  ? "Back to your library"
                  : "Save your first idea"}
              </button>
            </div>
          ) : (
            <div
              className={`content-grid ${layout === "list" ? "content-list" : ""}`}
            >
              {displayed.map((item) => (
                <Card
                  key={item.id}
                  id={item.id}
                  title={item.title}
                  link={item.link}
                  type={item.type}
                  description={item.description}
                  thumbnail={item.thumbnail}
                  onDelete={handleDelete}
                />
              ))}
            </div>
          )}
          <footer className="dashboard-footer">
            <Sparkles size={13} />
            <span>A calmer home for a curious mind.</span>
            <span>
              {displayed.length} saved{" "}
              {displayed.length === 1 ? "idea" : "ideas"}
            </span>
          </footer>
        </div>
      </main>
      <CreateContentModel
        open={modelOpen}
        onClose={() => setModelOpen(false)}
        onSuccess={fetchContent}
      />
    </div>
  );
}
