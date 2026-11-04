import { ArrowUpRight, Menu, X } from "lucide-react";
import { useState } from "react";
import { Link } from "react-router-dom";
import { isAuthenticated } from "../lib/api";
import Brand from "./Brand";

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const authenticated = isAuthenticated();
  return (
    <header className="site-header">
      <nav className="site-nav" aria-label="Main navigation">
        <Brand />
        <div className="desktop-nav">
          <a href="#features">Why Second Brain</a>
          <a href="#how-it-works">How it works</a>
          <a href="#questions">FAQs</a>
        </div>
        <div className="nav-actions">
          {!authenticated && (
            <Link className="login-link" to="/signin">
              Log in
            </Link>
          )}
          <Link
            to={authenticated ? "/dashboard" : "/signup"}
            className="nav-cta"
          >
            {authenticated ? "Your library" : "Get started free"}
            <ArrowUpRight size={16} />
          </Link>
          <button
            className="mobile-nav-toggle"
            aria-label={open ? "Close navigation" : "Open navigation"}
            aria-expanded={open}
            onClick={() => setOpen(!open)}
          >
            {open ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </nav>
      {open && (
        <div className="mobile-nav">
          <a href="#features" onClick={() => setOpen(false)}>
            Why Second Brain
          </a>
          <a href="#how-it-works" onClick={() => setOpen(false)}>
            How it works
          </a>
          <a href="#questions" onClick={() => setOpen(false)}>
            FAQs
          </a>
          <Link to="/signin">Log in</Link>
        </div>
      )}
    </header>
  );
}
