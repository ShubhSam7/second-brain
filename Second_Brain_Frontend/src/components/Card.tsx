import { useId, useState } from "react";
import {
  ArrowUpRight,
  ExternalLink,
  FileText,
  Github,
  Image,
  Instagram,
  Linkedin,
  Link2,
  LoaderCircle,
  Music,
  Trash2,
  Twitter,
  X,
  Youtube,
} from "lucide-react";
import type { ContentType } from "../lib/types";
import Dialog from "./Dialog";

interface CardProps {
  id: string;
  title: string;
  link: string;
  type: ContentType;
  description?: string;
  thumbnail?: string;
  onDelete?: (id: string) => void | Promise<void>;
  onEdit?: (id: string) => void;
}
const icons = {
  twitter: Twitter,
  youtube: Youtube,
  github: Github,
  medium: FileText,
  article: FileText,
  spotify: Music,
  instagram: Instagram,
  linkedin: Linkedin,
  image: Image,
  document: FileText,
};
export default function Card({
  id,
  title,
  link,
  type,
  description,
  thumbnail,
  onDelete,
  onEdit,
}: CardProps) {
  const [expanded, setExpanded] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState("");
  const [imageFailed, setImageFailed] = useState(false);
  const titleId = useId();
  const Icon = icons[type as keyof typeof icons] || Link2;
  let url: URL | undefined;
  try {
    const parsed = new URL(link);
    if (["https:", "http:"].includes(parsed.protocol)) url = parsed;
  } catch {
    /* Display a safe fallback for invalid saved links. */
  }
  const domain = url?.hostname.replace(/^www\./, "") || "Saved link";
  const href = url?.href;
  const youtubeHost = url?.hostname.replace(/^www\./, "");
  const videoCandidate =
    youtubeHost === "youtu.be"
      ? url?.pathname.slice(1)
      : youtubeHost === "youtube.com" || youtubeHost === "m.youtube.com"
        ? url?.searchParams.get("v") ||
          url?.pathname.match(/^\/(?:embed|shorts)\/([^/]+)/)?.[1]
        : undefined;
  const videoId =
    videoCandidate && /^[\w-]{11}$/.test(videoCandidate)
      ? videoCandidate
      : undefined;
  const remove = async () => {
    setDeleting(true);
    setError("");
    try {
      await onDelete?.(id);
      setConfirmDelete(false);
    } catch {
      setError("This idea couldn’t be deleted. Please try again.");
    } finally {
      setDeleting(false);
    }
  };
  return (
    <article className={`saved-card saved-${type}`}>
      <a
        className="saved-card-media"
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        aria-label={`Open ${title}`}
      >
        <span className="saved-card-source">
          <Icon size={13} />
          {domain}
        </span>
        {thumbnail && !imageFailed ? (
          <img
            src={thumbnail}
            alt=""
            loading="lazy"
            onError={() => setImageFailed(true)}
          />
        ) : (
          <div className="saved-card-art" aria-hidden="true">
            <span className="saved-art-circle" />
            <Icon size={39} strokeWidth={1} />
            <span className="saved-art-label">a little inspiration.</span>
          </div>
        )}
        <span className="saved-card-external">
          <ArrowUpRight size={16} />
        </span>
      </a>
      <div className="saved-card-body">
        <span className="saved-card-type">
          <span className="status-dot" />
          {type.replaceAll("-", " ")}
          <span className="saved-card-domain">{domain}</span>
        </span>
        <h3>
          <a href={href} target="_blank" rel="noopener noreferrer">
            {title}
          </a>
        </h3>
        <p>{description || "A little discovery, saved for later."}</p>
        <div className="saved-card-footer">
          <button className="read-summary" onClick={() => setExpanded(true)}>
            Read summary <ArrowUpRight size={12} />
          </button>
          {onDelete && (
            <button
              className="delete-content"
              aria-label={`Delete ${title}`}
              onClick={() => setConfirmDelete(true)}
            >
              <Trash2 size={14} />
            </button>
          )}
        </div>
      </div>
      {expanded && (
        <Dialog titleId={titleId} onClose={() => setExpanded(false)}>
          <div className="dialog-heading">
            <span className="dialog-icon">
              <Icon size={23} />
            </span>
            <button
              className="icon-button"
              aria-label="Close summary"
              onClick={() => setExpanded(false)}
            >
              <X size={19} />
            </button>
          </div>
          <span className="eyebrow">A LITTLE SOMETHING TO COME BACK TO</span>
          <h2 id={titleId}>{title}</h2>
          <span className="summary-domain">{domain}</span>
          {videoId && (
            <iframe
              className="summary-video"
              src={`https://www.youtube-nocookie.com/embed/${videoId}`}
              title={title}
              allow="accelerometer; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          )}
          <p className="summary-body">
            {description ||
              "No summary is available for this link yet. Open the original to explore it."}
          </p>
          <div className="dialog-actions">
            {onEdit && (
              <button
                className="app-secondary"
                onClick={() => {
                  setExpanded(false);
                  onEdit(id);
                }}
              >
                Add post text
              </button>
            )}
            <button
              className="app-secondary"
              onClick={() => setExpanded(false)}
            >
              Close
            </button>
            {href && (
              <a
                className="action-primary"
                href={href}
                target="_blank"
                rel="noopener noreferrer"
              >
                Open original <ExternalLink size={15} />
              </a>
            )}
          </div>
        </Dialog>
      )}
      {confirmDelete && (
        <Dialog
          titleId={titleId}
          onClose={() => setConfirmDelete(false)}
          busy={deleting}
        >
          <div className="dialog-heading">
            <span className="dialog-icon">
              <Trash2 size={22} />
            </span>
            <button
              className="icon-button"
              aria-label="Cancel deletion"
              onClick={() => setConfirmDelete(false)}
              disabled={deleting}
            >
              <X size={19} />
            </button>
          </div>
          <h2 id={titleId}>Let this idea go?</h2>
          <p className="dialog-description">
            “{title}” will be permanently removed from your library.
          </p>
          {error && (
            <p className="form-error" role="alert">
              {error}
            </p>
          )}
          <div className="dialog-actions">
            <button
              className="app-secondary"
              onClick={() => setConfirmDelete(false)}
              disabled={deleting}
            >
              Keep it
            </button>
            <button
              className="action-primary"
              onClick={remove}
              disabled={deleting}
            >
              {deleting ? (
                <LoaderCircle size={16} className="animate-spin" />
              ) : (
                <Trash2 size={15} />
              )}
              {deleting ? "Removing…" : "Delete content"}
            </button>
          </div>
        </Dialog>
      )}
    </article>
  );
}
