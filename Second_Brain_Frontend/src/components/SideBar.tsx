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
  Link,
  LogOut,
  User
} from 'lucide-react';
import { SideBarItem } from "./SideBarItem";
import type { CategoryType, ContentType } from "../lib/types";
import { getCurrentUser, signout } from "../lib/api";
import { useState, useEffect, useRef } from "react";

interface SideBarProps {
  activeFilter?: ContentType | CategoryType | "all";
  onFilterChange: (filter: ContentType | CategoryType | "all") => void;
  isOpen?: boolean;
}

export default function SideBar({ activeFilter = "all", onFilterChange, isOpen = true }: SideBarProps) {
  const username = getCurrentUser();
  const userInitial = username ? username.charAt(0).toUpperCase() : "U";
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const handleLogout = () => {
    if (window.confirm("Are you sure you want to logout?")) {
      signout();
    }
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    };

    if (showDropdown) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showDropdown]);

  return (
    <aside className={`h-screen w-72 bg-neutral-950 border-r border-neutral-800 flex flex-col transition-all duration-300 fixed overflow-y-auto ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}>
      {/* Subtle gradient overlay for depth */}
      <div className="absolute inset-0 bg-gradient-to-b from-neutral-950 via-neutral-950 to-neutral-900/50 pointer-events-none"></div>

      {/* Content wrapper with z-index to stay above gradient */}
      <div className="relative z-10 flex flex-col h-full flex-1">

      {/* 1. BRANDING HEADER */}
      <div className="p-6 flex items-center gap-3">
        <div className="p-2 bg-orange-500/10 rounded-xl border border-orange-500/20 shadow-lg shadow-orange-500/10">
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
            active={activeFilter === "all"}
            onClick={() => onFilterChange("all")}
          />
        </div>

        {/* Social Media Section */}
        <Section label="Social Media">
          <SideBarItem
            icon={<Twitter size={18} />}
            text="Twitter"
            active={activeFilter === "twitter"}
            onClick={() => onFilterChange("twitter")}
          />
          <SideBarItem
            icon={<Instagram size={18} />}
            text="Instagram"
            active={activeFilter === "instagram"}
            onClick={() => onFilterChange("instagram")}
          />
          <SideBarItem
            icon={<Linkedin size={18} />}
            text="LinkedIn"
            active={activeFilter === "linkedin"}
            onClick={() => onFilterChange("linkedin")}
          />
        </Section>

        {/* Video & Audio Section */}
        <Section label="Video & Audio">
          <SideBarItem
            icon={<Youtube size={18} />}
            text="YouTube"
            active={activeFilter === "youtube"}
            onClick={() => onFilterChange("youtube")}
          />
          <SideBarItem
            icon={<Music size={18} />}
            text="Spotify"
            active={activeFilter === "spotify"}
            onClick={() => onFilterChange("spotify")}
          />
        </Section>

        {/* Development Section */}
        <Section label="Development">
          <SideBarItem
            icon={<Github size={18} />}
            text="GitHub"
            active={activeFilter === "github"}
            onClick={() => onFilterChange("github")}
          />
          <SideBarItem
            icon={<FileText size={18} />}
            text="Articles"
            active={activeFilter === "medium"}
            onClick={() => onFilterChange("medium")}
          />
        </Section>

        {/* Other Section */}
        <Section label="Other">
          <SideBarItem
            icon={<Link size={18} />}
            text="Other Links"
            active={activeFilter === "other"}
            onClick={() => onFilterChange("other")}
          />
        </Section>
      </div>

      {/* 3. USER FOOTER */}
      <div className="p-4 border-t border-neutral-800 relative" ref={dropdownRef}>
        <div
          className="flex items-center gap-3 p-2 rounded-xl hover:bg-neutral-900 transition-colors cursor-pointer group"
          onClick={() => setShowDropdown(!showDropdown)}
        >
          <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-orange-500 to-red-500 flex items-center justify-center text-white font-bold text-sm shadow-lg shadow-orange-500/20">
            {userInitial}
          </div>
          <div className="flex-1 overflow-hidden">
            <p className="text-sm font-medium text-neutral-200 truncate">{username || "Guest"}</p>
            <p className="text-xs text-neutral-500 truncate">Free Plan</p>
          </div>
          <Settings className="w-4 h-4 text-neutral-500 group-hover:text-orange-500 transition-colors" />
        </div>

        {/* Dropdown Menu */}
        {showDropdown && (
          <div className="absolute bottom-full left-4 right-4 mb-2 bg-neutral-900 border border-neutral-800 rounded-xl shadow-2xl overflow-hidden">
            {/* Profile Option */}
            <button
              className="w-full flex items-center gap-3 px-4 py-3 text-sm text-neutral-300 hover:bg-neutral-800 hover:text-white transition-colors"
              onClick={(e) => {
                e.stopPropagation();
                setShowDropdown(false);
                // Add profile navigation here if needed
              }}
            >
              <User className="w-4 h-4" />
              <span>Profile</span>
            </button>

            {/* Logout Option */}
            <button
              className="w-full flex items-center gap-3 px-4 py-3 text-sm text-red-400 hover:bg-red-500/10 hover:text-red-300 transition-colors border-t border-neutral-800"
              onClick={(e) => {
                e.stopPropagation();
                setShowDropdown(false);
                handleLogout();
              }}
            >
              <LogOut className="w-4 h-4" />
              <span>Logout</span>
            </button>
          </div>
        )}
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
