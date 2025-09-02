import { BrainIcon } from "../icons/BrainIcon";
import { TwitterIcon } from "../icons/TwitterIcon";
import { YtIcon } from "../icons/YtIcon";
import { SideBarItem } from "./SideBarItem";

export default function SideBar() {
  return (
    <div className="h-screen bg-white w-72 border fixed">
      <div className="flex text-2xl font-bold items-center p-4 ">
        <BrainIcon />
        <div className="ml-4">Second Brain</div>
      </div>
      <div className="p-2 mt-4">
        <SideBarItem text="Twitter" icon={<TwitterIcon />} />
        <SideBarItem text="YouTube" icon={<YtIcon />} />
      </div>
    </div>
  );
}
