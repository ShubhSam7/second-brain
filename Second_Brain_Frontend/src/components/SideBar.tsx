import { BrainIcon } from "../icons/BrainIcon";
import { TwitterIcon } from "../icons/TwitterIcon";
import { YtIcon } from "../icons/YtIcon";
import { InstagramIcon } from "../icons/InstagramIcon";
import { LinkedinIcon } from "../icons/LinkedinIcon";
import { GithubIcon } from "../icons/GithubIcon";
import { MediumIcon } from "../icons/MediumIcon";
import { SpotifyIcon } from "../icons/SpotifyIcon";
import { DocumentIcon } from "../icons/DocumentIcon";
import { ImageIcon } from "../icons/ImageIcon";
import { LinkIcon } from "../icons/LinkIcon";
import { AllContentIcon } from "../icons/AllContentIcon";
import { SideBarItem } from "./SideBarItem";
import type { CategoryType } from "../lib/types";

interface SideBarProps {
  activeCategory?: CategoryType | "all";
  onCategoryChange: (category: CategoryType | "all") => void;
}

export default function SideBar({ activeCategory = "all", onCategoryChange }: SideBarProps) {
  return (
    <div className="h-screen bg-background-secondary w-72 border-r border-border-muted fixed overflow-y-auto">
      <div className="flex text-2xl font-bold items-center p-6 border-b border-border-muted">
        <BrainIcon />
        <div className="ml-4 text-text-primary tracking-wide">Second Brain</div>
      </div>

      <div className="p-4 mt-2">
        <SideBarItem
          text="All Content"
          icon={<AllContentIcon />}
          active={activeCategory === "all"}
          onClick={() => onCategoryChange("all")}
        />

        <div className="mt-6 mb-2 px-4 text-xs font-semibold text-text-muted uppercase tracking-wider">
          Social Media
        </div>
        <SideBarItem
          text="Twitter"
          icon={<TwitterIcon />}
          active={activeCategory === "social"}
          onClick={() => onCategoryChange("social")}
        />
        <SideBarItem
          text="Instagram"
          icon={<InstagramIcon />}
          active={activeCategory === "social"}
          onClick={() => onCategoryChange("social")}
        />
        <SideBarItem
          text="LinkedIn"
          icon={<LinkedinIcon />}
          active={activeCategory === "social"}
          onClick={() => onCategoryChange("social")}
        />

        <div className="mt-6 mb-2 px-4 text-xs font-semibold text-text-muted uppercase tracking-wider">
          Videos
        </div>
        <SideBarItem
          text="YouTube"
          icon={<YtIcon />}
          active={activeCategory === "video"}
          onClick={() => onCategoryChange("video")}
        />

        <div className="mt-6 mb-2 px-4 text-xs font-semibold text-text-muted uppercase tracking-wider">
          Code & Dev
        </div>
        <SideBarItem
          text="GitHub"
          icon={<GithubIcon />}
          active={activeCategory === "code"}
          onClick={() => onCategoryChange("code")}
        />

        <div className="mt-6 mb-2 px-4 text-xs font-semibold text-text-muted uppercase tracking-wider">
          Articles
        </div>
        <SideBarItem
          text="Medium"
          icon={<MediumIcon />}
          active={activeCategory === "article"}
          onClick={() => onCategoryChange("article")}
        />

        <div className="mt-6 mb-2 px-4 text-xs font-semibold text-text-muted uppercase tracking-wider">
          Audio
        </div>
        <SideBarItem
          text="Spotify"
          icon={<SpotifyIcon />}
          active={activeCategory === "audio"}
          onClick={() => onCategoryChange("audio")}
        />

        <div className="mt-6 mb-2 px-4 text-xs font-semibold text-text-muted uppercase tracking-wider">
          Media
        </div>
        <SideBarItem
          text="Images"
          icon={<ImageIcon />}
          active={activeCategory === "image"}
          onClick={() => onCategoryChange("image")}
        />
        <SideBarItem
          text="Documents"
          icon={<DocumentIcon />}
          active={activeCategory === "document"}
          onClick={() => onCategoryChange("document")}
        />

        <div className="mt-6 mb-2 px-4 text-xs font-semibold text-text-muted uppercase tracking-wider">
          Other
        </div>
        <SideBarItem
          text="Other Links"
          icon={<LinkIcon />}
          active={activeCategory === "other"}
          onClick={() => onCategoryChange("other")}
        />
      </div>
    </div>
  );
}
