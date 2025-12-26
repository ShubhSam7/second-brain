import {
  LayoutDashboard,
  Twitter,
  Youtube,
  Github,
  FileText,
  Music,
  Linkedin,
  Instagram,
  BrainCircuit,
  Settings,
  Image,
  Link,
  File
} from 'lucide-react';
import { SideBarItem } from "./SideBarItem";
import type { CategoryType } from "../lib/types";
import { getCurrentUser } from "../lib/api";

interface SideBarProps {
  activeCategory?: CategoryType | "all";
  onCategoryChange: (category: CategoryType | "all") => void;
}

export default function SideBar({ activeCategory = "all", onCategoryChange }: SideBarProps) {
  const username = getCurrentUser();
  const userInitial = username ? username.charAt(0).toUpperCase() : "U";

  return (
    <aside className="h-screen w-72 bg-neutral-950 border-r border-neutral-800 flex flex-col transition-all duration-300 fixed overflow-y-auto">

      {/* 1. BRANDING HEADER */}
      <div className="p-6 flex items-center gap-3">
        <div className="p-2 bg-orange-500/10 rounded-xl border border-orange-500/20">
          <BrainCircuit className="w-6 h-6 text-orange-500" />
        </div>
        <span className="text-xl font-bold tracking-tight text-neutral-100">
          Second<span className="text-neutral-500">Brain</span>
        </span>
      </div>

      {/* 2. SCROLLABLE MENU */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-6">

        {/* Main Section */}
        <div className="space-y-1">
          <SideBarItem
            icon={<LayoutDashboard size={20} />}
            text="All Content"
            active={activeCategory === "all"}
            onClick={() => onCategoryChange("all")}
          />
        </div>

        {/* Social Media Section */}
        <Section label="Social Media">
          <SideBarItem
            icon={<Twitter size={18} />}
            text="Twitter"
            active={activeCategory === "social"}
            onClick={() => onCategoryChange("social")}
          />
          <SideBarItem
            icon={<Instagram size={18} />}
            text="Instagram"
            active={activeCategory === "social"}
            onClick={() => onCategoryChange("social")}
          />
          <SideBarItem
            icon={<Linkedin size={18} />}
            text="LinkedIn"
            active={activeCategory === "social"}
            onClick={() => onCategoryChange("social")}
          />
        </Section>

        {/* Video & Audio Section */}
        <Section label="Video & Audio">
          <SideBarItem
            icon={<Youtube size={18} />}
            text="YouTube"
            active={activeCategory === "video"}
            onClick={() => onCategoryChange("video")}
          />
          <SideBarItem
            icon={<Music size={18} />}
            text="Spotify"
            active={activeCategory === "audio"}
            onClick={() => onCategoryChange("audio")}
          />
        </Section>

        {/* Development Section */}
        <Section label="Development">
          <SideBarItem
            icon={<Github size={18} />}
            text="GitHub"
            active={activeCategory === "code"}
            onClick={() => onCategoryChange("code")}
          />
          <SideBarItem
            icon={<FileText size={18} />}
            text="Articles"
            active={activeCategory === "article"}
            onClick={() => onCategoryChange("article")}
          />
        </Section>

        {/* Media Section */}
        <Section label="Media">
          <SideBarItem
            icon={<Image size={18} />}
            text="Images"
            active={activeCategory === "image"}
            onClick={() => onCategoryChange("image")}
          />
          <SideBarItem
            icon={<File size={18} />}
            text="Documents"
            active={activeCategory === "document"}
            onClick={() => onCategoryChange("document")}
          />
        </Section>

        {/* Other Section */}
        <Section label="Other">
          <SideBarItem
            icon={<Link size={18} />}
            text="Other Links"
            active={activeCategory === "other"}
            onClick={() => onCategoryChange("other")}
          />
        </Section>
      </div>

      {/* 3. USER FOOTER */}
      <div className="p-4 border-t border-neutral-800">
        <div className="flex items-center gap-3 p-2 rounded-xl hover:bg-neutral-900 transition-colors cursor-pointer group">
          <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-orange-500 to-red-500 flex items-center justify-center text-white font-bold text-sm">
            {userInitial}
          </div>
          <div className="flex-1 overflow-hidden">
            <p className="text-sm font-medium text-neutral-200 truncate">{username || "Guest"}</p>
            <p className="text-xs text-neutral-500 truncate">Free Plan</p>
          </div>
          <Settings className="w-4 h-4 text-neutral-500 group-hover:text-white transition-colors" />
        </div>
      </div>
    </aside>
  );
}

// --- HELPER COMPONENTS ---

// The Section Header (Small, uppercase text)
const Section = ({ label, children }: { label: string; children: React.ReactNode }) => (
  <div className="space-y-1">
    <h3 className="px-3 text-xs font-semibold text-neutral-500 uppercase tracking-wider mb-2">
      {label}
    </h3>
    {children}
  </div>
);
