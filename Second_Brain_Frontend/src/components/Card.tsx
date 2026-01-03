import type { ContentType } from "../lib/types";
import { useState } from "react";
import {
  Link,
  Twitter,
  Youtube,
  Github,
  FileText,
  Music,
  Linkedin,
  Instagram,
  Image,
  File,
  Trash2,
  Share2,
} from "lucide-react";

interface CardProps {
  id: string;
  title: string;
  link: string;
  type: ContentType;
  onDelete?: (id: string) => void;
}

// Helper function to get icon based on content type (for center display)
const getIconForType = (type: ContentType, size: "sm" | "lg" = "lg") => {
  const sizeClass = size === "sm" ? "w-4 h-4" : "w-8 h-8";
  const iconMap: Record<string, React.ReactNode> = {
    twitter: <Twitter className={sizeClass} />,
    instagram: <Instagram className={sizeClass} />,
    linkedin: <Linkedin className={sizeClass} />,
    youtube: <Youtube className={sizeClass} />,
    github: <Github className={sizeClass} />,
    medium: <FileText className={sizeClass} />,
    spotify: <Music className={sizeClass} />,
    image: <Image className={sizeClass} />,
    document: <File className={sizeClass} />,
    other: <Link className={sizeClass} />,
  };
  return iconMap[type] || <Link className={sizeClass} />;
};

// Placeholder gradient component for posts without thumbnails
const PlaceholderGradient = ({ type }: { type: ContentType }) => (
  <div className="w-full h-full bg-gradient-to-br from-neutral-900 via-neutral-800 to-orange-900/20 flex items-center justify-center overflow-hidden relative">
    {/* Subtle noise texture overlay */}
    <div className="absolute inset-0 opacity-10 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-white/5 via-transparent to-transparent"></div>

    {/* Center Icon */}
    <div className="p-4 bg-neutral-950/50 rounded-full backdrop-blur-sm border border-white/5 shadow-2xl group-hover:scale-110 transition-transform duration-300">
      {getIconForType(type)}
    </div>
  </div>
);

export default function Card({ id, title, link, type, onDelete }: CardProps) {
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent card click from triggering
    if (window.confirm(`Are you sure you want to delete "${title}"?`)) {
      setIsDeleting(true);
      try {
        if (onDelete) {
          await onDelete(id);
        }
      } catch (error) {
        console.error("Failed to delete:", error);
        setIsDeleting(false);
      }
    }
  };

  const handleCardClick = () => {
    window.open(link, "_blank", "noopener,noreferrer");
  };

  return (
    <div
      onClick={handleCardClick}
      className={`
        w-full h-[280px] sm:h-[340px]
        bg-neutral-900
        border border-neutral-800
        hover:border-orange-500/50
        rounded-xl
        shadow-xl
        overflow-hidden
        transition-all duration-300
        group
        flex flex-col
        cursor-pointer
        hover:shadow-2xl
        hover:shadow-orange-500/10
        ${isDeleting ? "opacity-50 pointer-events-none" : ""}
      `}
    >
      {/* TOP MEDIA SECTION (60% height) */}
      <div className="relative h-[60%] w-full overflow-hidden bg-neutral-950">
        {/* Render Media Content */}
        {type === "youtube" && (
          <iframe
            className="w-full h-full"
            src={link.replace("watch?v=", "embed/")}
            title="YouTube video player"
            frameBorder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            referrerPolicy="strict-origin-when-cross-origin"
            allowFullScreen
          ></iframe>
        )}

        {type === "twitter" && (
          <div className="w-full h-full overflow-auto bg-neutral-950 flex items-center justify-center p-4">
            <blockquote className="twitter-tweet" data-theme="dark">
              <a href={link.replace("x.com", "twitter.com")}></a>
            </blockquote>
          </div>
        )}

        {/* Show placeholder gradient for other content types */}
        {type !== "youtube" && type !== "twitter" && (
          <PlaceholderGradient type={type} />
        )}

        {/* HOVER OVERLAY - Action Buttons */}
        <div className="absolute top-0 right-0 p-2 sm:p-3 flex gap-1.5 sm:gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-20">
          <a
            href={link}
            target="_blank"
            rel="noreferrer"
            onClick={(e) => e.stopPropagation()}
            className="p-1.5 sm:p-2 bg-neutral-900/90 backdrop-blur-sm rounded-lg border border-neutral-700 hover:border-orange-500 hover:bg-orange-500/10 transition-all duration-200"
            title="Open link"
          >
            <Share2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-neutral-300 hover:text-orange-500" />
          </a>
          <button
            onClick={handleDelete}
            disabled={isDeleting}
            className="p-1.5 sm:p-2 bg-neutral-900/90 backdrop-blur-sm rounded-lg border border-neutral-700 hover:border-red-500 hover:bg-red-500/10 transition-all duration-200 disabled:opacity-50"
            title="Delete content"
          >
            <Trash2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-neutral-300 hover:text-red-500" />
          </button>
        </div>
      </div>

      {/* BOTTOM CONTENT SECTION (40% height) */}
      <div className="h-[40%] p-3 sm:p-4 flex flex-col justify-between">
        {/* Title with line clamp */}
        <h3 className="text-neutral-200 font-medium text-xs sm:text-sm line-clamp-2 mb-1 sm:mb-2">
          {title}
        </h3>

        {/* Footer Metadata */}
        <div className="flex items-center justify-between text-[10px] sm:text-xs text-neutral-500">
          <div className="flex items-center gap-1.5 sm:gap-2">
            {getIconForType(type, "sm")}
            <span className="capitalize">{type}</span>
          </div>
          <div className="text-neutral-600 truncate max-w-[100px] sm:max-w-[120px]">
            {new URL(link).hostname.replace("www.", "")}
          </div>
        </div>
      </div>
    </div>
  );
}
