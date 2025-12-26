import { CrossIcon } from "../icons/CrossIcon";
import { Button } from "./Button";
import { Input } from "./Input";
import { useState } from "react";
import { createContent } from "../lib/api";

interface CreateContentModelProps {
  open: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export default function CreateContentModel({ open, onClose, onSuccess }: CreateContentModelProps) {
  const [link, setLink] = useState("");
  const [title, setTitle] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async () => {
    // Validation
    if (!link.trim()) {
      setError("Content link is required");
      return;
    }
    if (!title.trim()) {
      setError("Title is required");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      await createContent({ link: link.trim(), title: title.trim() });
      // Reset form
      setLink("");
      setTitle("");
      // Call success callback to refresh content list
      if (onSuccess) {
        onSuccess();
      }
      // Close modal
      onClose();
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || err.message || "Failed to add content";
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setLink("");
    setTitle("");
    setError(null);
    onClose();
  };

  return (
    <div>
      {open && (
        <div className="flex fixed bg-black/60 backdrop-blur-sm w-full h-full top-0 left-0 justify-center items-center z-50 animate-fade-in">
          <div className="bg-surface border border-border-muted rounded-xl p-8 max-w-md w-full mx-4 shadow-2xl animate-slide-up">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-2xl font-bold text-text-primary tracking-wide">Add Content</h3>
              <button
                onClick={handleClose}
                className="text-text-secondary hover:text-accent-primary transition-colors duration-300"
              >
                <CrossIcon />
              </button>
            </div>
            <div className="space-y-4">
              <Input
                placeholder="Title"
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
              />
              <Input
                placeholder="Content Link (URL)"
                type="url"
                value={link}
                onChange={(e) => setLink(e.target.value)}
                required
              />
              {error && (
                <div className="text-red-400 text-sm mt-2">{error}</div>
              )}
            </div>
            <div className="flex justify-end gap-3 mt-6">
              <Button
                variant="secondary"
                text="Cancel"
                size="md"
                onClick={handleClose}
                disabled={loading}
              />
              <Button
                variant="primary"
                text={loading ? "Submitting..." : "Submit"}
                size="md"
                onClick={handleSubmit}
                disabled={loading}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
