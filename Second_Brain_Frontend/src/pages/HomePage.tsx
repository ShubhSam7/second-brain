import {
  ArrowDown,
  ArrowRight,
  Check,
  ChevronDown,
  Layers3,
  Link2,
  Search,
  Sparkles,
} from "lucide-react";
import { Link } from "react-router-dom";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import LibraryPreview from "../components/home/LibraryPreview";
import { isAuthenticated } from "../lib/api";

const features = [
  {
    icon: Link2,
    number: "01",
    title: "Save the good stuff.",
    text: "An insightful article. A video worth revisiting. A thread that clicks. Bring it all together with a link.",
  },
  {
    icon: Sparkles,
    number: "02",
    title: "A little help from AI.",
    text: "Get a title, a useful summary, and a place for every link. Less organizing, more connecting the dots.",
  },
  {
    icon: Search,
    number: "03",
    title: "Find that thing again.",
    text: "Search the way you think. Find what you saved by the idea behind it, even when the exact words escape you.",
  },
];

export default function HomePage() {
  const destination = isAuthenticated() ? "/dashboard" : "/signup";
  return (
    <div className="landing-page">
      <Navbar />
      <main>
        <section className="landing-hero" id="home">
          <div className="hero-grid" aria-hidden="true" />
          <div className="hero-copy">
            <span className="eyebrow">
              <span className="status-dot" /> A CLEARER MIND STARTS HERE
            </span>
            <h1>
              Good ideas deserve
              <br />a place to <em>stay.</em>
              <span className="headline-spark" aria-hidden="true">
                ✳
              </span>
            </h1>
            <p>
              Your favorite links, passing thoughts, and next big ideas.
              <br className="desktop-break" /> One calm space to collect them. A
              second brain to connect them.
            </p>
            <div className="hero-actions">
              <Link className="action-primary" to={destination}>
                Build your second brain <ArrowRight size={17} />
              </Link>
              <a className="action-text" href="#your-library">
                Take a look inside <ArrowDown size={16} />
              </a>
            </div>
            <div className="hero-footnote">
              <Check size={13} /> Free to get started <span>·</span> A little
              less mental clutter
            </div>
          </div>
          <div className="preview-wrap" id="your-library">
            <div className="preview-caption">
              <span>
                <span className="status-dot" /> A HOME FOR EVERYTHING THAT
                INSPIRES YOU
              </span>
              <span>
                YOUR IDEAS. BEAUTIFULLY CONNECTED. <ArrowDown size={12} />
              </span>
            </div>
            <LibraryPreview />
          </div>
        </section>
        <section
          className="sources-strip"
          aria-label="Supported content sources"
        >
          <p>
            From all over the internet.
            <br />
            <strong>Finally, all in one place.</strong>
          </p>
          <div className="source-wordmarks">
            <span>
              ▶ <b>YouTube</b>
            </span>
            <span>
              𝕏 <b>Twitter</b>
            </span>
            <span>
              ●◐ <b>Medium</b>
            </span>
            <span>
              <Layers3 size={22} />
              <b>GitHub</b>
            </span>
            <span>
              ◉ <b>Spotify</b>
            </span>
            <span className="source-more">
              & everything else <Link2 size={17} />
            </span>
          </div>
        </section>
        <section className="feature-section section-container" id="features">
          <div className="section-intro">
            <div>
              <span className="eyebrow">
                LESS FRICTION. MORE LIGHTBULB MOMENTS.
              </span>
              <h2>
                A small habit.
                <br />
                <em>A clearer head.</em>
              </h2>
            </div>
            <p>
              You don’t need another complicated system.
              <br />
              Just somewhere your curiosity can feel at home.
            </p>
          </div>
          <div className="feature-grid">
            {features.map(({ icon: Icon, number, title, text }) => (
              <article className="feature-tile" key={number}>
                <div className="feature-top">
                  <span className="feature-icon">
                    <Icon size={22} strokeWidth={1.6} />
                  </span>
                  <span>{number}</span>
                </div>
                <h3>{title}</h3>
                <p>{text}</p>
              </article>
            ))}
          </div>
        </section>
        <section
          className="connection-section section-container"
          id="how-it-works"
        >
          <div className="connection-visual" aria-hidden="true">
            <div className="orbit orbit-one" />
            <div className="orbit orbit-two" />
            <span className="orbit-node node-book">
              <Link2 />
            </span>
            <span className="orbit-node node-search">
              <Search />
            </span>
            <span className="orbit-node node-link">
              <Sparkles />
            </span>
            <span className="orbit-node node-share">
              <Layers3 />
            </span>
            <div className="connection-center">
              <Layers3 size={38} strokeWidth={1.3} />
              <span>your second brain</span>
            </div>
            <span className="connection-note">
              a few links. a world of possibilities.
            </span>
          </div>
          <div className="connection-copy">
            <span className="eyebrow">MADE FOR YOUR CURIOUS MIND</span>
            <h2>
              Collect a little.
              <br />
              <em>Connect a lot.</em>
            </h2>
            <p>
              The best ideas rarely arrive fully formed. They start with
              something you read, something you watched, something you wanted to
              come back to.
            </p>
            <p>
              Give those little discoveries a home. Find them when you need
              them. And share your brain when you’re ready.
            </p>
            <Link to={destination} className="action-text">
              Make room for your next idea <ArrowRight size={17} />
            </Link>
          </div>
        </section>
        <section className="faq-section section-container" id="questions">
          <div>
            <span className="eyebrow">A FEW THINGS YOU MIGHT BE WONDERING</span>
            <h2>
              Curious? <em>Good.</em>
            </h2>
          </div>
          <div className="faq-list">
            {[
              [
                "What can I save?",
                "Save links to articles, videos, social posts, music, code repositories, documents, and more. Your library keeps them together so you can come back whenever inspiration strikes.",
              ],
              [
                "How does the AI help?",
                "When you add a link, AI helps generate its title and summary. Semantic search also lets you look for an idea in your own words, instead of remembering an exact title.",
              ],
              [
                "Can I share my library?",
                "Yes. From your dashboard, use Share Brain to create a public link to your saved library. You can remove the link when you no longer want to share it.",
              ],
            ].map(([question, answer]) => (
              <details key={question}>
                <summary>
                  {question}
                  <ChevronDown size={18} />
                </summary>
                <p>{answer}</p>
              </details>
            ))}
          </div>
        </section>
        <section className="closing-cta section-container">
          <span className="eyebrow">
            <Sparkles size={14} /> YOUR NEXT GREAT IDEA IS ALREADY OUT THERE
          </span>
          <h2>
            Give it somewhere <em>to land.</em>
          </h2>
          <Link className="action-primary" to={destination}>
            Start your second brain <ArrowRight size={17} />
          </Link>
          <p>Less scattered. More inspired.</p>
        </section>
      </main>
      <Footer />
    </div>
  );
}
