import { DeleteIcon } from "../icons/DeleteIcon";
import { ShareIcon } from "../icons/ShareIcon";
import type { ContentType } from "../lib/types";
import { useState } from "react";

interface CardProps {
  id: string;
  title: string;
  link: string;
  type: ContentType;
  onDelete?: (id: string) => void;
}

export default function Card({ id, title, link, type, onDelete }: CardProps) {
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
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

  return (
    <div className={`w-90 h-[350px] bg-surface border border-border-muted shadow-xl rounded-xl flex flex-col gap-3 p-4 overflow-hidden hover:border-accent-primary/30 transition-all duration-300 group ${isDeleting ? 'opacity-50 pointer-events-none' : ''}`}>
      <div className="flex justify-between items-center">
        <div className="text-text-secondary flex items-center">
          <div className="pl-2">{title}</div>
        </div>
        <div className="flex items-center gap-3">
          <a href={link} target="_blank" rel="noreferrer" className="text-text-secondary hover:text-accent-primary transition-colors duration-300">
            <ShareIcon />
          </a>
          <button
            onClick={handleDelete}
            disabled={isDeleting}
            className="text-text-secondary hover:text-red-400 transition-colors duration-300 disabled:opacity-50"
            title="Delete content"
          >
            <DeleteIcon />
          </button>
        </div>
      </div>
      {/* //embed the frame */}
      <div className="pt-4">
        {type === "youtube" && (
          <div className="aspect-video w-full mt-4">
            <iframe
              className="w-full h-[240px] rounded-lg border border-border-muted"
              src={link.replace("watch?v=", "embed/")}
              title="YouTube video player"
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              referrerPolicy="strict-origin-when-cross-origin"
              allowFullScreen
            ></iframe>
          </div>
        )}

        {type === "twitter" && (
          <div className="h-[280px] overflow-auto">
            <blockquote className="twitter-tweet">
              <a href={link.replace("x.com", "twitter.com")}></a>
            </blockquote>
          </div>
        )}
      </div>
    </div>
  );
}
