import { useState } from "react";
import {
  ArrowDownWideNarrow,
  ArrowUpRight,
  Bookmark,
  Check,
  ChevronDown,
  FileText,
  Github,
  LayoutGrid,
  List,
  Plus,
  Search,
  Sparkles,
  Twitter,
  Youtube,
} from "lucide-react";
import { Link } from "react-router-dom";
import Brand from "../Brand";

const examples = [
  {
    title: "A practical guide to a calmer mind",
    description:
      "Small, intentional habits to make space for what really matters.",
    type: "Articles",
    source: "medium.com",
    tag: "Mindful living",
    art: "mind",
    icon: FileText,
    link: "https://medium.com/tag/mindfulness",
  },
  {
    title: "Build a second brain with Tiago Forte",
    description:
      "A simple system for turning information into your next great idea.",
    type: "Videos",
    source: "youtube.com",
    tag: "Personal growth",
    art: "video",
    icon: Youtube,
    link: "https://www.youtube.com/@TiagoForte",
  },
  {
    title: "On creativity & connecting the dots",
    description:
      "A reminder to follow your curiosity. The dots will connect later.",
    type: "Tweets",
    source: "x.com",
    tag: "A little inspiration",
    art: "quote",
    icon: Twitter,
    link: "https://x.com",
  },
  {
    title: "Tools for a more thoughtful workflow",
    description:
      "An open-source collection of useful tools to help your ideas grow.",
    type: "Code",
    source: "github.com",
    tag: "Tools for thought",
    art: "code",
    icon: Github,
    link: "https://github.com/topics/productivity",
  },
];
const filters = [
  { name: "All content", icon: LayoutGrid },
  { name: "Articles", icon: FileText },
  { name: "Videos", icon: Youtube },
  { name: "Tweets", icon: Twitter },
  { name: "Code", icon: Github },
];

export default function LibraryPreview() {
  const [filter, setFilter] = useState("All content");
  const [query, setQuery] = useState("");
  const [list, setList] = useState(false);
  const [reverse, setReverse] = useState(false);
  const shown = examples.filter(
    (item) =>
      (filter === "All content" || item.type === filter) &&
      `${item.title} ${item.description} ${item.tag}`
        .toLowerCase()
        .includes(query.toLowerCase()),
  );
  if (reverse) shown.reverse();
  return (
    <div className="library-preview" aria-label="Interactive example library">
      <aside className="preview-sidebar">
        <Brand />
        <span className="preview-workspace">
          YOUR WORKSPACE <ChevronDown size={12} />
        </span>
        <div className="preview-filters">
          {filters.map(({ name, icon: Icon }) => (
            <button
              className={filter === name ? "active" : ""}
              key={name}
              onClick={() => setFilter(name)}
              aria-pressed={filter === name}
            >
              <Icon size={16} />
              <span>{name}</span>
              <small>{name === "All content" ? "4" : "1"}</small>
            </button>
          ))}
        </div>
        <div className="preview-collection">
          <span className="sidebar-label">A LITTLE INSPIRATION</span>
          <p>
            <span className="collection-dot" /> Your next big idea
          </p>
          <p>
            <span className="collection-dot sage" /> Things to come back to
          </p>
        </div>
        <div className="preview-tip">
          <Sparkles size={17} />
          <strong>Let curiosity lead.</strong>
          <p>
            Save something today.
            <br />
            Thank yourself tomorrow.
          </p>
        </div>
        <div className="preview-person">
          <span>Y</span>
          <div>
            Your personal space<small>A mind with room to grow</small>
          </div>
          <ChevronDown size={13} />
        </div>
      </aside>
      <div className="preview-main">
        <div className="preview-topbar">
          <span>
            My workspace <span>/</span> <strong>{filter}</strong>
          </span>
          <span className="demo-label">
            <span className="status-dot" /> LIVE PREVIEW
          </span>
        </div>
        <div className="preview-content">
          <div className="library-heading">
            <div>
              <h3>
                A little more connected<span>.</span>
              </h3>
              <p>Everything you’ve saved. Ready when you are.</p>
            </div>
            <Link className="mini-primary" to="/signup">
              <Plus size={15} /> Add content
            </Link>
          </div>
          <label className="preview-search">
            <Search size={16} />
            <input
              aria-label="Search example library"
              placeholder="Find an idea, not just a keyword…"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
            />
            <span>
              <Sparkles size={12} /> AI-powered search
            </span>
          </label>
          <div className="preview-toolbar">
            <div className="preview-tabs">
              <button
                className={filter === "All content" ? "selected" : ""}
                onClick={() => setFilter("All content")}
              >
                All content <small>{examples.length}</small>
              </button>
              <span>Your personal corner of the internet</span>
            </div>
            <div className="preview-view-controls">
              <button
                aria-label={
                  reverse ? "Show original order" : "Reverse example order"
                }
                onClick={() => setReverse(!reverse)}
              >
                <ArrowDownWideNarrow size={13} />
                <span>{reverse ? "Reversed" : "Recent"}</span>
              </button>
              <div>
                <button
                  aria-label="Grid view"
                  aria-pressed={!list}
                  className={!list ? "active" : ""}
                  onClick={() => setList(false)}
                >
                  <LayoutGrid size={14} />
                </button>
                <button
                  aria-label="List view"
                  aria-pressed={list}
                  className={list ? "active" : ""}
                  onClick={() => setList(true)}
                >
                  <List size={15} />
                </button>
              </div>
            </div>
          </div>
          <div className={`example-grid ${list ? "example-list" : ""}`}>
            {shown.map(
              ({ title, description, source, tag, art, icon: Icon, link }) => (
                <a
                  className="example-card"
                  key={title}
                  href={link}
                  target="_blank"
                  rel="noreferrer"
                >
                  <div className={`example-art art-${art}`}>
                    <span className="art-source">
                      <Icon size={12} />
                      {source}
                    </span>
                    <span className="card-bookmark">
                      <Bookmark size={13} />
                    </span>
                    {art === "mind" && (
                      <div className="mind-art">
                        <span className="mind-ring" />
                        <span className="mind-shape" />
                        <span className="mind-line" />
                        <span className="art-caption">
                          a little less,
                          <br />
                          <em>a little better.</em>
                        </span>
                      </div>
                    )}
                    {art === "video" && (
                      <div className="video-art">
                        <span className="video-line">
                          Ideas are just the beginning.
                        </span>
                        <span className="video-title">
                          Make room
                          <br />
                          for <em>more.</em>
                        </span>
                        <span className="play-button">▶</span>
                        <span className="video-time">12:48</span>
                      </div>
                    )}
                    {art === "quote" && (
                      <div className="quote-art">
                        <span className="quote-mark">“</span>
                        <p>
                          Creativity is just
                          <br />
                          connecting things.
                        </p>
                        <span>STAY CURIOUS. KEEP COLLECTING.</span>
                        <span className="quote-asterisk">✳</span>
                      </div>
                    )}
                    {art === "code" && (
                      <div className="code-art">
                        <span>const secondBrain = {"{"}</span>
                        <span>
                          &nbsp; ideas: <i>'unlimited'</i>,
                        </span>
                        <span>
                          &nbsp; curiosity: <i>true</i>,
                        </span>
                        <span>
                          &nbsp; clutter: <i>0</i>
                        </span>
                        <span>{"}"};</span>
                      </div>
                    )}
                  </div>
                  <div className="example-card-copy">
                    <span className={`example-tag tag-${art}`}>
                      <span />
                      {tag}
                    </span>
                    <h4>{title}</h4>
                    <p>{description}</p>
                    <div className="example-card-footer">
                      <span>
                        <Icon size={12} />
                        {source}
                      </span>
                      <ArrowUpRight size={14} />
                    </div>
                  </div>
                </a>
              ),
            )}
          </div>
          {shown.length === 0 && (
            <div className="preview-empty">
              <Search size={24} />
              <p>No ideas found. Try a different search.</p>
              <button
                onClick={() => {
                  setQuery("");
                  setFilter("All content");
                }}
              >
                Show all examples
              </button>
            </div>
          )}
          <div className="preview-bottom">
            <span>
              <Check size={12} /> A few examples of what your brain could look
              like.
            </span>
            <span>
              More clarity, less clutter <Sparkles size={12} />
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
