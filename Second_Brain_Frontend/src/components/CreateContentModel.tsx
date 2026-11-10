import { useId, useState } from "react";
import { ArrowRight, Link2, LoaderCircle, Sparkles, X } from "lucide-react";
import { createContent, updateContentText } from "../lib/api";
import type { Content } from "../lib/types";
import Dialog from "./Dialog";

interface CreateContentModelProps {
  open: boolean;
  onClose: () => void;
  onSuccess?: (content: Content, message: string) => void;
  existing?: Content | null;
}
export default function CreateContentModel({
  open,
  onClose,
  onSuccess,
  existing,
}: CreateContentModelProps) {
  const [link, setLink] = useState(existing?.link || "");
  const [title, setTitle] = useState(existing?.title || "");
  const [sourceText, setSourceText] = useState("");
  const [showText, setShowText] = useState(Boolean(existing));
  const [saved, setSaved] = useState<Content | null>(existing || null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [needsText, setNeedsText] = useState(false);
  const titleId = useId(),
    linkId = useId(),
    textId = useId(),
    nameId = useId();
  const close = () => {
    if (!loading) onClose();
  };
  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    try {
      const url = new URL(link.trim());
      if (!["http:", "https:"].includes(url.protocol)) throw new Error();
    } catch {
      setError("Enter a complete link starting with https:// or http://.");
      return;
    }
    if ((saved || sourceText.trim()) && sourceText.trim().length < 20) {
      setError("Add at least 20 characters of post text or caption.");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const result = saved
        ? await updateContentText(
            saved.id,
            sourceText.trim(),
            title.trim() || undefined,
          )
        : await createContent({
            link: link.trim(),
            title: title.trim() || undefined,
            sourceText: sourceText.trim() || undefined,
          });
      if (
        !sourceText.trim() &&
        result.processing?.extraction === "unavailable"
      ) {
        setSaved(result.content);
        setTitle(result.content.title);
        setShowText(true);
        setNeedsText(true);
        onSuccess?.(
          result.content,
          "Link saved. Add its post text or caption to make the content searchable.",
        );
      } else {
        onSuccess?.(
          result.content,
          result.processing?.indexed === false
            ? "Saved and searchable by keywords. Smart search is temporarily unavailable."
            : "Saved. Your content is ready to search.",
        );
        onClose();
      }
    } catch {
      setError(
        "We couldn’t save this content. Your text is still here; please try again.",
      );
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
      <span className="eyebrow">
        {saved ? "MAKE THIS LINK EASIER TO FIND" : "FOLLOW YOUR CURIOSITY"}
      </span>
      <h2 id={titleId}>
        {saved ? "Add the post text." : "Save a little inspiration."}
      </h2>
      <p className="dialog-description">
        {needsText
          ? "Your link is saved, but its page couldn’t be read. Paste the text or caption below to create a summary and search it."
          : saved
            ? "Paste the post, caption, or notes you want to find later. This updates the summary and searchable text for this link."
            : "Save a link, or include its post text or caption for a more useful summary."}
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
          onChange={(e) => setLink(e.target.value)}
          required
          readOnly={Boolean(saved)}
          disabled={loading}
        />
        {!showText && (
          <button
            type="button"
            className="capture-toggle"
            onClick={() => setShowText(true)}
          >
            Add post text or caption <span>Optional</span>
          </button>
        )}
        {showText && (
          <>
            <label className="field-label" htmlFor={nameId}>
              Title <span>Optional</span>
            </label>
            <input
              id={nameId}
              className="dialog-input"
              value={title}
              maxLength={200}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="A title you’ll remember"
              disabled={loading}
            />
            <label className="field-label" htmlFor={textId}>
              Post text, caption, or notes
            </label>
            <textarea
              id={textId}
              className="dialog-input capture-text"
              rows={6}
              value={sourceText}
              onChange={(e) => setSourceText(e.target.value)}
              placeholder="Paste the text you want to summarize and search…"
              minLength={20}
              maxLength={80000}
              required={Boolean(saved)}
              disabled={loading}
            />
            <p className="capture-hint">
              Only the text you add will be summarized. Useful for social posts,
              captions, and pages we can’t read.
            </p>
          </>
        )}
        <div className="dialog-hint">
          <Sparkles size={15} />
          <span>
            {loading
              ? "Preparing your summary and search index…"
              : sourceText.trim()
                ? "We’ll summarize this text and keep it linked to the original."
                : saved
                  ? "Add at least 20 characters to create a useful summary."
                  : "We’ll find a title and summary from the page when available."}
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
            {needsText ? "Keep link only" : "Cancel"}
          </button>
          <button className="action-primary" type="submit" disabled={loading}>
            {loading ? (
              <LoaderCircle size={16} className="animate-spin" />
            ) : (
              <ArrowRight size={16} />
            )}{" "}
            {loading
              ? "Saving…"
              : saved
                ? "Save text & update search"
                : "Save to your brain"}
          </button>
        </div>
      </form>
    </Dialog>
  );
}
