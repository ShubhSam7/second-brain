import { Layers3 } from "lucide-react";
import { Link } from "react-router-dom";

export default function Brand({ compact = false }: { compact?: boolean }) {
  return (
    <Link to="/" className="brand" aria-label="Second Brain home">
      <span className="brand-mark">
        <Layers3 size={21} strokeWidth={1.7} />
      </span>
      {!compact && (
        <span>
          second<span className="brand-light">brain</span>
          <span className="brand-period">.</span>
        </span>
      )}
    </Link>
  );
}
