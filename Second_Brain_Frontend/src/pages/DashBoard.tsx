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
  return (
    <div>

      <SideBar />

      <div className="ml-72 min-h-screen bg-gray-200 border-2">
        <CreateContentModel
          open={modelOpen}
          onClose={() => setModelOpen(false)}
        ></CreateContentModel>
        
        <div className = "flex justify-between itmes-center m-4">
          <div className="text-3xl font-bold">All Notes</div>
          <div className="flex mr-2">
            <Button
              startIcon={<ShareIcon />}
              variant="primary"
              text="Share Brain"
              size="md"
              padding = "mr-4"
            ></Button>
            <Button
              onClick={() => setModelOpen(true)}
              startIcon={<PlusIcon />}
              variant="secondary"
              text="Add Content"
              size="md"
            ></Button>
          </div>
        </div>

        <div className=" flex flex-wrap gap-4 p-4">
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
