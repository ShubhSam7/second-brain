import { useEffect, useState } from "react";
import { ArrowRight, BookOpen, LoaderCircle } from "lucide-react";
import { Link, useParams } from "react-router-dom";
import Brand from "../components/Brand";
import Card from "../components/Card";
import { getSharedBrain } from "../lib/api";
import type { Content } from "../lib/types";

export default function SharedBrain() {
  const { hash } = useParams();
  const [data, setData] = useState<{
    username: string;
    content: Content[];
  } | null>(null);
  const [error, setError] = useState(false);
  useEffect(() => {
    let active = true;
    getSharedBrain(hash || "")
      .then((response) => {
        if (active) setData(response);
      })
      .catch(() => {
        if (active) setError(true);
      });
    return () => {
      active = false;
    };
  }, [hash]);
  return (
    <div className="shared-page">
      <header className="site-header">
        <div className="site-nav">
          <Brand />
          <Link to="/signup" className="nav-cta">
            Create your own space <ArrowRight size={15} />
          </Link>
        </div>
      </header>
      <main className="section-container shared-content">
        <span className="eyebrow">A LITTLE INSPIRATION, SHARED WITH YOU</span>
        <h1>
          {data
            ? `${data.username}’s second brain.`
            : "A world of little discoveries."}
        </h1>
        <p className="shared-description">
          A collection of things worth coming back to.
        </p>
        {error ? (
          <div className="content-state">
            <BookOpen size={28} />
            <h3>This space isn’t available.</h3>
            <p>The link may have been removed. Ask the owner for a new one.</p>
            <Link className="action-primary" to="/">
              Back to home <ArrowRight size={15} />
            </Link>
          </div>
        ) : !data ? (
          <div className="content-state" role="status">
            <LoaderCircle className="animate-spin" size={28} />
            <p>Opening this collection…</p>
          </div>
        ) : data.content.length === 0 ? (
          <div className="content-state">
            <BookOpen size={28} />
            <h3>A fresh space, ready for ideas.</h3>
            <p>There’s nothing in this collection just yet.</p>
          </div>
        ) : (
          <div className="content-grid">
            {data.content.map((item) => (
              <Card key={item.id} {...item} />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
