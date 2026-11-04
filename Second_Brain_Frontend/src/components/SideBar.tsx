import {
  FileText,
  Github,
  Instagram,
  LayoutGrid,
  Linkedin,
  Link2,
  LogOut,
  Music,
  Sparkles,
  Twitter,
  X,
  Youtube,
} from "lucide-react";
import type { CategoryType, ContentType } from "../lib/types";
import { getCurrentUser, signout } from "../lib/api";
import Brand from "./Brand";
import { useEffect } from "react";

interface SideBarProps {
  activeFilter?: ContentType | CategoryType | "all";
  onFilterChange: (filter: ContentType | CategoryType | "all") => void;
  isOpen?: boolean;
  onClose?: () => void;
}
const groups = [
  {
    label: "YOUR LIBRARY",
    items: [{ name: "All content", value: "all", icon: LayoutGrid }],
  },
  {
    label: "READ, WATCH & LISTEN",
    items: [
      { name: "Articles", value: "article", icon: FileText },
      { name: "YouTube", value: "youtube", icon: Youtube },
      { name: "Spotify", value: "spotify", icon: Music },
    ],
  },
  {
    label: "FROM AROUND THE WEB",
    items: [
      { name: "Twitter", value: "twitter", icon: Twitter },
      { name: "Instagram", value: "instagram", icon: Instagram },
      { name: "LinkedIn", value: "linkedin", icon: Linkedin },
      { name: "GitHub", value: "github", icon: Github },
      { name: "Other links", value: "other", icon: Link2 },
    ],
  },
];
export default function SideBar({
  activeFilter = "all",
  onFilterChange,
  isOpen,
  onClose,
}: SideBarProps) {
  const username = getCurrentUser() || "Your space";
  useEffect(() => {
    if (!isOpen) return;
    const escape = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose?.();
    };
    document.addEventListener("keydown", escape);
    return () => document.removeEventListener("keydown", escape);
  }, [isOpen, onClose]);
  return (
    <aside
      className={`app-sidebar ${isOpen ? "is-open" : ""}`}
      aria-label="Library navigation"
    >
      <div className="app-sidebar-brand">
        <Brand />
        <button
          className="mobile-sidebar-close"
          aria-label="Close navigation"
          onClick={onClose}
        >
          <X size={18} />
        </button>
      </div>
      <div className="app-workspace">
        <span className="workspace-avatar">
          {username.charAt(0).toUpperCase()}
        </span>
        <div>
          {username}
          <small>Personal workspace</small>
        </div>
      </div>
      <nav>
        {groups.map((group) => (
          <div className="app-nav-group" key={group.label}>
            <span className="sidebar-label">{group.label}</span>
            {group.items.map(({ name, value, icon: Icon }) => (
              <button
                key={value}
                className={activeFilter === value ? "active" : ""}
                aria-current={activeFilter === value ? "page" : undefined}
                onClick={() => {
                  onFilterChange(value as ContentType | CategoryType | "all");
                  onClose?.();
                }}
              >
                <Icon size={17} strokeWidth={1.6} />
                {name}
                {activeFilter === value && <span className="status-dot" />}
              </button>
            ))}
          </div>
        ))}
      </nav>
      <div className="app-sidebar-bottom">
        <div className="app-sidebar-tip">
          <Sparkles size={18} />
          <h3>A little less mental clutter.</h3>
          <p>
            Save what inspires you.
            <br />
            We’ll help you find it again.
          </p>
        </div>
        <div className="app-user">
          <span className="workspace-avatar">
            {username.charAt(0).toUpperCase()}
          </span>
          <div>
            {username}
            <small>Make yourself at home</small>
          </div>
          <button onClick={signout} aria-label="Log out" title="Log out">
            <LogOut size={16} />
          </button>
        </div>
      </div>
    </aside>
  );
}
