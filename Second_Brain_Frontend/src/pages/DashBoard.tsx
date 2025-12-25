import "../index.css";
import { Button } from "../components/Button";
import { PlusIcon } from "../icons/PlusIcon";
import Card from "../components/Card";
import { ShareIcon } from "../icons/ShareIcon";
import CreateContentModel from "../components/CreateContentModel";
import { useState } from "react";
import SideBar from "../components/SideBar";

export default function DashBoard() {
  const [modelOpen, setModelOpen] = useState(false);
  const [activeCategory, setActiveCategory] = useState<any>("all");

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
        ></CreateContentModel>

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
          <Card
            title="Share"
            type="youtube"
            link="https://www.youtube.com/watch?v=TnAMqYjKwfM"
          />
          <Card
            title="Share"
            type="twitter"
            link="https://x.com/heyhexadecimal/status/1941052582983790720"
          />
        </div>

      </div>
    </div>
  );
}
