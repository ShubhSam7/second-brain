import type { ContentType } from "../lib/types";
import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
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
  X,
  ExternalLink,
} from "lucide-react";

interface CardProps {
  id: string;
  title: string;
  link: string;
  type: ContentType;
  description?: string;
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

export default function Card({
  id,
  title,
  link,
  type,
  description,
  onDelete,
}: CardProps) {
  const [isDeleting, setIsDeleting] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Close modal on ESC key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isModalOpen) {
        setIsModalOpen(false);
      }
    };

    if (isModalOpen) {
      document.addEventListener("keydown", handleEscape);
      document.body.style.overflow = "hidden";
    }

    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = "unset";
    };
  }, [isModalOpen]);

  const handleDelete = async (e: React.MouseEvent) => {
    e.stopPropagation();
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

  const handleOpenModal = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  return (
    <div
      onClick={handleCardClick}
      className={`
        w-full h-[320px] sm:h-[360px]
        bg-neutral-900/50
        backdrop-blur-sm
        border border-neutral-800
        hover:border-orange-500/60
        rounded-2xl
        shadow-lg
        overflow-hidden
        transition-all duration-300
        group
        flex flex-col
        cursor-pointer
        hover:shadow-2xl
        hover:shadow-orange-500/20
        hover:scale-[1.02]
        ${isDeleting ? "opacity-50 pointer-events-none" : ""}
      `}
    >
      {/* TOP MEDIA SECTION */}
      <div className="relative h-[45%] w-full overflow-hidden bg-neutral-950">
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
        <div className="absolute top-0 right-0 p-3 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-20">
          <a
            href={link}
            target="_blank"
            rel="noreferrer"
            onClick={(e) => e.stopPropagation()}
            className="p-2 bg-black/80 backdrop-blur-md rounded-lg border border-neutral-700 hover:border-orange-500 hover:bg-orange-500/20 transition-all duration-200"
            title="Open link"
          >
            <Share2 className="w-4 h-4 text-neutral-300 hover:text-orange-400" />
          </a>
          <button
            onClick={handleDelete}
            disabled={isDeleting}
            className="p-2 bg-black/80 backdrop-blur-md rounded-lg border border-neutral-700 hover:border-red-500 hover:bg-red-500/20 transition-all duration-200 disabled:opacity-50"
            title="Delete content"
          >
            <Trash2 className="w-4 h-4 text-neutral-300 hover:text-red-400" />
          </button>
        </div>
      </div>

      {/* BOTTOM CONTENT SECTION */}
      <div className="h-[65%] p-4 sm:p-5 flex flex-col justify-between bg-gradient-to-b from-neutral-900/80 to-neutral-900">
        <div className="flex-1 overflow-hidden space-y-2">
          {/* Title */}
          <h3 className="text-neutral-100 font-semibold text-sm sm:text-base line-clamp-2 leading-snug">
            {title}
          </h3>

          {/* Description - AI Generated Summary with Read More */}
          {description ? (
            <div>
              <p className="text-neutral-400 text-xs sm:text-sm leading-relaxed line-clamp-3">
                {description}
              </p>
              <button
                onClick={handleOpenModal}
                className="text-orange-500 hover:text-orange-400 text-xs mt-1.5 font-medium transition-colors"
              >
                Read More →
              </button>
            </div>
          ) : (
            <p className="text-neutral-500 text-xs italic">No description available</p>
          )}
        </div>

        {/* Footer Metadata */}
        <div className="flex items-center justify-between text-xs text-neutral-500 pt-3 border-t border-neutral-800/50">
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-neutral-800/50 rounded-md">
              {getIconForType(type, "sm")}
            </div>
            <span className="capitalize font-medium">{type}</span>
          </div>
          <div className="text-neutral-600 truncate max-w-[120px] sm:max-w-[140px] text-xs">
            {new URL(link).hostname.replace("www.", "")}
          </div>
        </div>
      </div>

      {/* Expandable Modal Overlay */}
      {isModalOpen && createPortal(
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fadeIn"
          onClick={handleCloseModal}
          role="dialog"
          aria-modal="true"
          aria-labelledby="modal-title"
        >
          {/* Backdrop with blur */}
          <div className="absolute inset-0 bg-black/55 backdrop-blur-lg" />

          {/* Modal Container with Glassmorphism */}
          <div
            className="relative bg-neutral-900/90 backdrop-blur-xl border border-neutral-700/50 rounded-2xl shadow-2xl max-w-[720px] w-full max-h-[85vh] overflow-hidden animate-scaleIn"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="sticky top-0 bg-neutral-900/95 backdrop-blur-md border-b border-neutral-800 p-6 flex items-start justify-between gap-4 z-10">
              <div className="flex-1 min-w-0">
                <h2 id="modal-title" className="text-neutral-100 font-semibold text-lg sm:text-xl leading-tight break-words">
                  {title}
                </h2>
                <div className="flex items-center gap-2 mt-2 text-xs text-neutral-500">
                  <div className="p-1.5 bg-neutral-800/50 rounded-md">
                    {getIconForType(type, "sm")}
                  </div>
                  <span className="capitalize font-medium">{type}</span>
                  <span className="text-neutral-600">•</span>
                  <span className="text-neutral-600 truncate">
                    {new URL(link).hostname.replace("www.", "")}
                  </span>
                </div>
              </div>

              <button
                onClick={handleCloseModal}
                className="p-2 hover:bg-neutral-800 rounded-lg transition-colors flex-shrink-0"
                aria-label="Close modal"
              >
                <X className="w-5 h-5 text-neutral-400" />
              </button>
            </div>

            {/* Modal Body - Scrollable Content */}
            <div className="overflow-y-auto max-h-[calc(85vh-200px)] p-6">
              <div className="prose prose-invert max-w-none">
                <p className="text-neutral-300 text-sm sm:text-base leading-relaxed whitespace-pre-wrap">
                  {description}
                </p>
              </div>
            </div>

            {/* Modal Footer - Action Buttons */}
            <div className="sticky bottom-0 bg-neutral-900/95 backdrop-blur-md border-t border-neutral-800 p-6 flex gap-3 z-10">
              <a
                href={link}
                target="_blank"
                rel="noopener noreferrer"
                onClick={(e) => e.stopPropagation()}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-orange-500 hover:bg-orange-600 text-white rounded-lg font-medium transition-colors"
              >
                <ExternalLink className="w-4 h-4" />
                Open Link
              </a>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleCloseModal();
                  handleDelete(e);
                }}
                className="px-4 py-2.5 bg-neutral-800 hover:bg-red-500/20 hover:border-red-500 border border-neutral-700 text-neutral-300 hover:text-red-400 rounded-lg font-medium transition-all flex items-center gap-2"
              >
                <Trash2 className="w-4 h-4" />
                Delete
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}
