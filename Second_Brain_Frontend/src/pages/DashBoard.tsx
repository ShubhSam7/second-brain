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
import type { CategoryType } from "../lib/types";

export default function DashBoard() {
  const [modelOpen, setModelOpen] = useState(false);
  const [activeCategory, setActiveCategory] = useState<CategoryType | "all">("all");
  const [shareLink, setShareLink] = useState<string | null>(null);
  const [isSharing, setIsSharing] = useState(false);

  const categoryFilter = activeCategory === "all" ? undefined : { category: activeCategory };
  const { content, loading, error, fetchContent, removeContent } = useContent(categoryFilter);

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

  return (
    <div>
      <SideBar
        activeCategory={activeCategory}
        onCategoryChange={setActiveCategory}
      />

      <div className="ml-72 min-h-screen bg-background-primary">
        <CreateContentModel
          open={modelOpen}
          onClose={() => setModelOpen(false)}
          onSuccess={fetchContent}
        />

        <div className="flex justify-between items-center p-8 border-b border-border-muted">
          <div className="text-3xl font-bold text-text-primary tracking-wide">
            {activeCategory === "all" ? "All Notes" : `${activeCategory.charAt(0).toUpperCase() + activeCategory.slice(1)} Content`}
          </div>
          <div className="flex gap-3">
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

        <div className="flex flex-wrap gap-6 p-8">
          {loading ? (
            <div className="text-text-secondary text-lg">Loading your content...</div>
          ) : error ? (
            <div className="text-red-400 text-lg">Error: {error}</div>
          ) : content.length === 0 ? (
            <div className="text-text-secondary text-lg">
              No content yet. Click "Add Content" to get started!
            </div>
          ) : (
            content.map((item) => (
              <Card
                key={item._id}
                id={item._id}
                title={item.title}
                type={item.type}
                link={item.link}
                onDelete={handleDeleteContent}
              />
            ))
          )}
        </div>

      </div>
    </div>
  );
}
