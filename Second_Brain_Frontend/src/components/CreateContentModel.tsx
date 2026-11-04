import { useId, useState } from "react";
import { ArrowRight, Link2, LoaderCircle, Sparkles, X } from "lucide-react";
import { createContent } from "../lib/api";
import Dialog from "./Dialog";

interface CreateContentModelProps {
  open: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}
export default function CreateContentModel({
  open,
  onClose,
  onSuccess,
}: CreateContentModelProps) {
  const [link, setLink] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const titleId = useId();
  const linkId = useId();
  const close = () => {
    setLink("");
    setError("");
    onClose();
  };
  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    try {
      const url = new URL(link.trim());
      if (!["http:", "https:"].includes(url.protocol)) throw new Error();
    } catch {
      setError(
        "Please enter a complete link starting with https:// or http://.",
      );
      return;
    }
    setLoading(true);
    setError("");
    try {
      await createContent({ link: link.trim() });
      onSuccess?.();
      close();
    } catch {
      setError("We couldn’t save that link. Please check it and try again.");
    } finally {
      setLoading(false);
    }
  };
  if (!open) return null;
  return (
    <Dialog titleId={titleId} onClose={close} busy={loading}>
      <div className="dialog-heading">
        <span className="dialog-icon">
          <Link2 size={23} strokeWidth={1.5} />
        </span>
        <button
          className="icon-button"
          aria-label="Close add content"
          onClick={close}
          disabled={loading}
        >
          <X size={19} />
        </button>
      </div>
      <span className="eyebrow">FOLLOW YOUR CURIOSITY</span>
      <h2 id={titleId}>Save a little inspiration.</h2>
      <p className="dialog-description">
        An article, a video, an idea worth keeping.
        <br />
        Give it a home in your second brain.
      </p>
      <form onSubmit={submit}>
        <label className="field-label" htmlFor={linkId}>
          Content link
        </label>
        <input
          id={linkId}
          className="dialog-input"
          type="url"
          placeholder="https://something-that-inspired-you.com"
          value={link}
          onChange={(event) => setLink(event.target.value)}
          required
          disabled={loading}
        />
        <div className="dialog-hint">
          <Sparkles size={15} />
          <span>
            {loading
              ? "Finding the details and making a summary. This may take a moment…"
              : "A little help from AI: we’ll find a title and create a summary for you."}
          </span>
        </div>
        {error && (
          <p className="form-error" role="alert">
            {error}
          </p>
        )}
        <div className="dialog-actions">
          <button
            className="app-secondary"
            type="button"
            onClick={close}
            disabled={loading}
          >
            Cancel
          </button>
          <button className="action-primary" type="submit" disabled={loading}>
            {loading ? (
              <LoaderCircle size={16} className="animate-spin" />
            ) : (
              <ArrowRight size={16} />
            )}
            {loading ? "Saving your idea…" : "Save to your brain"}
          </button>
        </div>
      </form>
    </Dialog>
  );
}
