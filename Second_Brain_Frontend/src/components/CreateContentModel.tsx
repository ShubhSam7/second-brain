import { CrossIcon } from "../icons/CrossIcon";
import { LoaderIcon } from "../icons/LoaderIcon";
import { Button } from "./Button";
import { Input } from "./Input";
import { useState } from "react";
import { createContent } from "../lib/api";

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
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async () => {
    // Validation
    if (!link.trim()) {
      setError("Content link is required");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Backend now auto-generates title and summary using AI
      await createContent({ link: link.trim() });
      // Reset form
      setLink("");
      // Call success callback to refresh content list
      if (onSuccess) {
        onSuccess();
      }
      // Close modal
      onClose();
    } catch (err: any) {
      let errorMessage = "Failed to add content";

      if (err.response?.data?.errors && Array.isArray(err.response.data.errors)) {
        // Handle Zod validation errors
        errorMessage = err.response.data.errors.map((e: any) => e.message).join(", ");
      } else if (err.response?.data?.message) {
        errorMessage = err.response.data.message;
      } else if (err.message) {
        errorMessage = err.message;
      }

      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setLink("");
    setError(null);
    onClose();
  };

  return (
    <div>
      {open && (
        <div className="flex fixed bg-black/60 backdrop-blur-sm w-full h-full top-0 left-0 justify-center items-center z-50 animate-fade-in">
          <div className="bg-surface border border-border-muted rounded-xl p-8 max-w-md w-full mx-4 shadow-2xl animate-slide-up">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-2xl font-bold text-text-primary tracking-wide">
                {loading ? "Analyzing Content..." : "Add Content"}
              </h3>
              <button
                onClick={handleClose}
                disabled={loading}
                className="text-text-secondary hover:text-accent-primary transition-colors duration-300 disabled:opacity-50"
              >
                <CrossIcon />
              </button>
            </div>
            <div className="space-y-4">
              <Input
                placeholder="Paste URL here (e.g., https://example.com/article)"
                type="url"
                value={link}
                onChange={(e) => setLink(e.target.value)}
                disabled={loading}
                required
              />
              {loading && (
                <div className="flex items-center gap-2 text-accent-primary text-sm bg-accent-primary/10 p-3 rounded-lg">
                  <LoaderIcon />
                  <span>
                    Scraping content, generating summary & embedding...
                  </span>
                </div>
              )}
              {error && (
                <div className="text-red-400 text-sm bg-red-400/10 p-3 rounded-lg">
                  {error}
                </div>
              )}
              {!loading && (
                <div className="text-text-secondary text-xs bg-surface-light p-3 rounded-lg">
                  ℹ️ AI will automatically extract title and generate summary
                </div>
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
                text={loading ? "Analyzing..." : "Add Content"}
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
