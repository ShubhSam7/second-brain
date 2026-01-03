import "../index.css";
import { Button } from "../components/Button";
import { PlusIcon } from "../icons/PlusIcon";
import Card from "../components/Card";
import { ShareIcon } from "../icons/ShareIcon";
import CreateContentModel from "../components/CreateContentModel";
import { useState } from "react";
import SideBar from "../components/SideBar";
import { useContent } from "../hooks/useContent";
import { createShareLink, removeShareLink } from "../lib/api";
import type { CategoryType, ContentType } from "../lib/types";
import { Menu } from "lucide-react";

export default function DashBoard() {
  const [modelOpen, setModelOpen] = useState(false);
  const [activeFilter, setActiveFilter] = useState<ContentType | CategoryType | "all">("all");
  const [shareLink, setShareLink] = useState<string | null>(null);
  const [isSharing, setIsSharing] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Determine filter type based on the active filter value
  const getContentFilter = () => {
    if (activeFilter === "all") return undefined;

    // Check if it's a content type
    const contentTypes: ContentType[] = ['twitter', 'instagram', 'linkedin', 'youtube', 'spotify', 'github', 'medium', 'image', 'document', 'other'];
    if (contentTypes.includes(activeFilter as ContentType)) {
      return { type: activeFilter as ContentType };
    }

    // Otherwise it's a category
    return { category: activeFilter as CategoryType };
  };

  const { content, loading, error, fetchContent, removeContent } = useContent(getContentFilter());

  const handleShareBrain = async () => {
    setIsSharing(true);
    try {
      if (shareLink) {
        // Remove existing share link
        await removeShareLink();
        setShareLink(null);
        alert("Share link removed successfully!");
      } else {
        // Create new share link
        const response = await createShareLink();
        const fullLink = `${window.location.origin}/brain/${response.hash}`;
        setShareLink(fullLink);
        // Copy to clipboard
        await navigator.clipboard.writeText(fullLink);
        alert(`Share link created and copied to clipboard!\n${fullLink}`);
      }
    } catch (error: any) {
      alert(error.message || "Failed to manage share link");
    } finally {
      setIsSharing(false);
    }
  };

  const handleDeleteContent = async (id: string) => {
    try {
      await removeContent(id);
    } catch (error: any) {
      alert(error.message || "Failed to delete content");
      throw error;
    }
  };

  const getPageTitle = () => {
    if (activeFilter === "all") return "All Notes";
    return `${activeFilter.charAt(0).toUpperCase() + activeFilter.slice(1)} Content`;
  };

  return (
    <div className="relative">
      {/* Blur Overlay */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 transition-opacity duration-300"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      <SideBar
        activeFilter={activeFilter}
        onFilterChange={setActiveFilter}
        isOpen={isSidebarOpen}
      />

      <div className="min-h-screen bg-background-primary">
        <CreateContentModel
          open={modelOpen}
          onClose={() => setModelOpen(false)}
          onSuccess={fetchContent}
        />

        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center p-4 sm:p-8 border-b border-border-muted gap-4">
          <div className="flex items-center gap-3 sm:gap-4 w-full sm:w-auto">
            <button
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="p-2 rounded-lg bg-neutral-900 border border-neutral-800 hover:border-orange-500/50 hover:bg-orange-500/10 transition-all duration-200 flex-shrink-0"
              title={isSidebarOpen ? "Close sidebar" : "Open sidebar"}
            >
              <Menu className="w-5 h-5 text-neutral-300" />
            </button>
            <div className="text-2xl sm:text-3xl font-bold text-text-primary tracking-wide truncate">
              {getPageTitle()}
            </div>
          </div>
          <div className="flex gap-2 sm:gap-3 w-full sm:w-auto">
            <Button
              onClick={handleShareBrain}
              startIcon={<ShareIcon />}
              variant="secondary"
              text={shareLink ? "Remove Share Link" : "Share Brain"}
              size="md"
              disabled={isSharing}
            />
            <Button
              onClick={() => setModelOpen(true)}
              startIcon={<PlusIcon />}
              variant="primary"
              text="Add Content"
              size="md"
            />
          </div>
        </div>

        <div className="p-4 sm:p-8 w-full flex justify-center">
          <div className="w-full max-w-7xl">
            {loading ? (
              <div className="text-text-secondary text-lg">Loading your content...</div>
            ) : error ? (
              <div className="text-red-400 text-lg">Error: {error}</div>
            ) : content.length === 0 ? (
              <div className="text-text-secondary text-lg">
                No content yet. Click "Add Content" to get started!
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
                {content.map((item) => (
                  <Card
                    key={item.id}
                    id={item.id}
                    title={item.title}
                    type={item.type}
                    link={item.link}
                    onDelete={handleDeleteContent}
                  />
                ))}
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
