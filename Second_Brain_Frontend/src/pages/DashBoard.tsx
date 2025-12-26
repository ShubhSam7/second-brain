import "../index.css";
import { Button } from "../components/Button";
import { PlusIcon } from "../icons/PlusIcon";
import Card from "../components/Card";
import { ShareIcon } from "../icons/ShareIcon";
import CreateContentModel from "../components/CreateContentModel";
import { useState } from "react";
import SideBar from "../components/SideBar";
import { useContent } from "../hooks/useContent";
import type { CategoryType } from "../lib/types";

export default function DashBoard() {
  const [modelOpen, setModelOpen] = useState(false);
  const [activeCategory, setActiveCategory] = useState<CategoryType | "all">("all");
  const { content, loading, error, fetchContent } = useContent();

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
          <div className="text-3xl font-bold text-text-primary tracking-wide">All Notes</div>
          <div className="flex gap-3">
            <Button
              startIcon={<ShareIcon />}
              variant="secondary"
              text="Share Brain"
              size="md"
            ></Button>
            <Button
              onClick={() => setModelOpen(true)}
              startIcon={<PlusIcon />}
              variant="primary"
              text="Add Content"
              size="md"
            ></Button>
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
                title={item.title}
                type={item.type}
                link={item.link}
              />
            ))
          )}
        </div>

      </div>
    </div>
  );
}
